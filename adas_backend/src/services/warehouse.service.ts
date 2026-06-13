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
    const skip = (page - 1) * pageSize;
    const where = { warehouseType };

    const [list, total] = await Promise.all([
      prisma.warehouseDispatch.findMany({
        where,
        include: { product: true, client: true },
        orderBy: { dispatchDate: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.warehouseDispatch.count({ where }),
    ]);

    return { list, total };
  }

  async createDispatch(data: {
    warehouseType: WarehouseType;
    clientId?: number | null;
    note?: string;
    dispatchDate?: string;
    items: { productId: number; quantity: number; sellPrice: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      // Validate stock for all items IN PARALLEL instead of sequentially
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

      const created = await tx.warehouseDispatch.createMany({
        data: data.items.map((item) => ({
          warehouseType: data.warehouseType,
          productId: item.productId,
          quantity: item.quantity,
          sellPrice: item.sellPrice,
          totalSellPrice: item.quantity * item.sellPrice,
          clientId: data.clientId || undefined,
          note: data.note || '',
          dispatchDate,
        })),
      });

      return created;
    });
  }

  async deleteDispatch(id: number) {
    return await prisma.warehouseDispatch.delete({ where: { id } });
  }
}

export const warehouseService = new WarehouseService();
