import prisma from '../utils/prismaClient';

type WarehouseType = 'IMPORT' | 'EXPORT';

export class WarehouseService {
  async getStock(warehouseType: WarehouseType) {
    const arrivals = await prisma.warehouseArrival.groupBy({
      by: ['productId'],
      where: { warehouseType },
      _sum: { quantity: true },
    });

    const dispatches = await prisma.warehouseDispatch.groupBy({
      by: ['productId'],
      where: { warehouseType },
      _sum: { quantity: true },
    });

    const stockMap = new Map<number, { arrived: number; dispatched: number }>();

    for (const a of arrivals) {
      stockMap.set(a.productId, { arrived: a._sum.quantity || 0, dispatched: 0 });
    }
    for (const d of dispatches) {
      const existing = stockMap.get(d.productId);
      if (existing) {
        existing.dispatched = d._sum.quantity || 0;
      } else {
        stockMap.set(d.productId, { arrived: 0, dispatched: d._sum.quantity || 0 });
      }
    }

    const productIds = Array.from(stockMap.keys());
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { unit: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    return Array.from(stockMap.entries()).map(([productId, stock]) => ({
      productId,
      product: productMap.get(productId),
      totalArrived: stock.arrived,
      totalDispatched: stock.dispatched,
      currentStock: stock.arrived - stock.dispatched,
    }));
  }

  async getArrivals(warehouseType: WarehouseType, filters: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 10 } = filters;
    const skip = (page - 1) * pageSize;
    const where = { warehouseType };

    const [list, total] = await Promise.all([
      prisma.warehouseArrival.findMany({
        where,
        include: { product: true, supplier: true, client: true, purchaseOrder: true },
        orderBy: { arrivalDate: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.warehouseArrival.count({ where }),
    ]);

    return { list, total };
  }

  async createArrival(data: {
    warehouseType: WarehouseType;
    productId: number;
    quantity: number;
    unitPrice: number;
    supplierId?: number | null;
    purchaseOrderId?: number | null;
    clientId?: number | null;
    note?: string;
    arrivalDate?: string;
  }) {
    return await prisma.warehouseArrival.create({
      data: {
        warehouseType: data.warehouseType,
        productId: data.productId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.quantity * data.unitPrice,
        supplierId: data.supplierId || undefined,
        purchaseOrderId: data.purchaseOrderId || undefined,
        clientId: data.clientId || undefined,
        note: data.note || '',
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : new Date(),
      },
      include: { product: true, supplier: true, client: true },
    });
  }

  async deleteArrival(id: number) {
    return await prisma.warehouseArrival.delete({ where: { id } });
  }

  async getDispatches(warehouseType: WarehouseType, filters: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 10 } = filters;

    // Fetch all dispatches for this warehouse type, ordered newest first
    const allDispatches = await prisma.warehouseDispatch.findMany({
      where: { warehouseType },
      include: { product: { include: { unit: true } }, client: true },
      orderBy: { dispatchDate: 'desc' },
    });

    // Group by dispatchGroupId; fall back to individual id for legacy rows
    const groupMap = new Map<number, typeof allDispatches>();
    for (const d of allDispatches) {
      const key = d.dispatchGroupId ?? d.id;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(d);
    }

    // Keep insertion order (already sorted desc by dispatchDate for the first item)
    const groupEntries = Array.from(groupMap.entries());
    const total = groupEntries.length;
    const paginatedGroups = groupEntries.slice((page - 1) * pageSize, page * pageSize);

    const list = paginatedGroups.map(([key, items]) => {
      const first = items[0];
      return {
        dispatchGroupId: key,
        dispatchName: first.dispatchName || '',
        dispatchDate: first.dispatchDate,
        client: first.client || null,
        totalSellPrice: items.reduce((sum, d) => sum + Number(d.totalSellPrice), 0),
        itemCount: items.length,
        items,
      };
    });

    return { list, total };
  }

  async getDispatchById(dispatchGroupId: number) {
    const items = await prisma.warehouseDispatch.findMany({
      where: {
        OR: [
          { dispatchGroupId },
          { id: dispatchGroupId } // For legacy fallback
        ]
      },
      include: { product: { include: { unit: true } }, client: true },
      orderBy: { dispatchDate: 'desc' },
    });

    if (!items.length) {
      throw new Error('Dispatch not found');
    }

    const first = items[0];
    return {
      dispatchGroupId: dispatchGroupId,
      dispatchName: first.dispatchName || '',
      dispatchDate: first.dispatchDate,
      client: first.client || null,
      totalSellPrice: items.reduce((sum, d) => sum + Number(d.totalSellPrice), 0),
      itemCount: items.length,
      items,
    };
  }

  async createDispatch(data: {
    warehouseType: WarehouseType;
    dispatchName?: string;
    clientId?: number | null;
    note?: string;
    dispatchDate?: string;
    isLoan?: boolean;
    purchaseOrderId?: number | null;
    items: { productId: number; quantity: number; sellPrice: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      // Validate stock for all items
      await Promise.all(
        data.items.map(async (item) => {
          const [arrivals, dispatches] = await Promise.all([
            tx.warehouseArrival.aggregate({
              where: { warehouseType: data.warehouseType, productId: item.productId },
              _sum: { quantity: true },
            }),
            tx.warehouseDispatch.aggregate({
              where: { warehouseType: data.warehouseType, productId: item.productId },
              _sum: { quantity: true },
            }),
          ]);
          const currentStock = (arrivals._sum.quantity || 0) - (dispatches._sum.quantity || 0);
          if (item.quantity > currentStock) {
            throw new Error(
              `Insufficient stock for product ID ${item.productId}. Available: ${currentStock}, Requested: ${item.quantity}`
            );
          }
        })
      );

      const dispatchDate = data.dispatchDate ? new Date(data.dispatchDate) : new Date();
      const dispatchName = data.dispatchName || '';

      // Create each dispatch row — dispatchGroupId set after we know the first id
      const createdDispatches = await Promise.all(
        data.items.map((item) =>
          tx.warehouseDispatch.create({
            data: {
              warehouseType: data.warehouseType,
              dispatchName,
              productId: item.productId,
              quantity: item.quantity,
              sellPrice: item.sellPrice,
              totalSellPrice: item.quantity * item.sellPrice,
              clientId: data.clientId || undefined,
              purchaseOrderId: data.purchaseOrderId || undefined,
              note: data.note || '',
              dispatchDate,
            },
          })
        )
      );

      // Use the first dispatch's id as the shared group id for all rows in this batch
      const groupId = createdDispatches[0].id;
      await tx.warehouseDispatch.updateMany({
        where: { id: { in: createdDispatches.map(d => d.id) } },
        data: { dispatchGroupId: groupId },
      });

      // Auto-create Loan records if this is a loan dispatch and a client is set
      if (data.isLoan && data.clientId) {
        await Promise.all(
          createdDispatches.map((dispatch) =>
            tx.loan.create({
              data: {
                type: data.warehouseType === 'IMPORT' ? 'IMPORT' : 'EXPORT',
                clientId: data.clientId!,
                totalAmount: dispatch.totalSellPrice,
                paidAmount: 0,
                note: data.note || '',
                dispatchId: dispatch.id,
                dispatchGroupId: groupId,
                dispatchName,
                purchaseOrderId: data.purchaseOrderId || undefined,
              },
            })
          )
        );
      }

      return createdDispatches;
    });
  }

  async deleteDispatch(id: number) {
    return await prisma.warehouseDispatch.delete({ where: { id } });
  }
}

export const warehouseService = new WarehouseService();
