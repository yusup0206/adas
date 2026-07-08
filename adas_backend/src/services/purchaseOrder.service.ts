import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient';

export class PurchaseOrderService {
  async createPurchaseOrder(data: {
    orderName: string;
    supplierId: number;
    totalPrice: number;
    items: { productId: number; quantity: number; unitPrice: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          orderName: data.orderName,
          supplierId: data.supplierId,
          totalPrice: data.totalPrice,
          paidAmount: 0,
          status: 'PENDING',
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
      });

      await tx.supplier.update({
        where: { id: data.supplierId },
        data: {
          totalAmount: { increment: data.totalPrice },
          remainingDebt: { increment: data.totalPrice },
        },
      });

      return order;
    });
  }

  async recordPayment(orderId: number, amount: number, payDate?: string | Date) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");

      const updatedOrder = await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
          paidAmount: { increment: amount },
          ...(payDate && { lastPayDate: new Date(payDate) }),
        },
      });

      await tx.supplier.update({
        where: { id: order.supplierId },
        data: {
          paidAmount: { increment: amount },
          remainingDebt: { decrement: amount },
        },
      });

      return updatedOrder;
    });
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
    arrivalDate: Date,
    partialItems?: { productId: number; quantity: number }[],
  ) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error('Order not found');

      // Auto-create IMPORT warehouse arrivals when status changes to RECEIVED
      if (status === 'RECEIVED' && order.status !== 'RECEIVED') {
        const arrivalData = order.items.map((item) => ({
          warehouseType: 'IMPORT' as const,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          supplierId: order.supplierId,
          purchaseOrderId: order.id,
          note: `Auto-arrived from Order ${order.orderName}`,
          arrivalDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        await tx.warehouseArrival.createMany({ data: arrivalData });
      }

      // For HALF_ARRIVED: only create arrivals for the specified partial items
      if (status === 'HALF_ARRIVED' && partialItems && partialItems.length > 0) {
        // Build a map of productId -> unitPrice from the order items
        const priceMap = new Map(
          order.items.map((item) => [item.productId, item.unitPrice]),
        );

        const arrivalData = partialItems
          .filter((pi) => priceMap.has(pi.productId) && pi.quantity > 0)
          .map((pi) => {
            const unitPrice = priceMap.get(pi.productId)!;
            const totalPrice = new Prisma.Decimal(unitPrice).times(pi.quantity);
            return {
              warehouseType: 'IMPORT' as const,
              productId: pi.productId,
              quantity: pi.quantity,
              unitPrice,
              totalPrice,
              supplierId: order.supplierId,
              purchaseOrderId: order.id,
              note: `Partial arrival from Order ${order.orderName}`,
              arrivalDate,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          });

        if (arrivalData.length > 0) {
          await tx.warehouseArrival.createMany({ data: arrivalData });
        }
      }

      return await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status },
      });
    });
  }

  async deleteOrder(orderId: number) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error("Order not found");

      // Revert supplier balance
      await tx.supplier.update({
        where: { id: order.supplierId },
        data: {
          totalAmount: { decrement: order.totalPrice },
          paidAmount: { decrement: order.paidAmount },
          remainingDebt: { decrement: new Prisma.Decimal(order.totalPrice).minus(order.paidAmount) },
        },
      });

      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: orderId } });
      return await tx.purchaseOrder.delete({ where: { id: orderId } });
    });
  }

  async updateOrder(
    orderId: number,
    data: {
      orderName?: string;
      supplierId?: number;
      totalPrice?: number;
      status?: OrderStatus;
      items?: { productId: number; quantity: number; unitPrice: number }[];
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Fetch current order to compute balance diff
      const existing = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
      });
      if (!existing) throw new Error('Order not found');

      const oldTotal = Number(existing.totalPrice);
      const newTotal = data.totalPrice !== undefined ? Number(data.totalPrice) : oldTotal;
      const totalDiff = newTotal - oldTotal;

      const oldSupplierId = existing.supplierId;
      const newSupplierId = data.supplierId ?? oldSupplierId;

      // If items are provided, delete old items and insert the new ones
      if (data.items && data.items.length > 0) {
        await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: orderId } });
        await tx.purchaseOrderItem.createMany({
          data: data.items.map((item) => ({
            purchaseOrderId: orderId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        });
      }

      // Update the order itself
      const updated = await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
          ...(data.orderName !== undefined && { orderName: data.orderName }),
          ...(data.supplierId !== undefined && { supplierId: data.supplierId }),
          ...(data.totalPrice !== undefined && { totalPrice: data.totalPrice }),
          ...(data.status !== undefined && { status: data.status }),
        },
      });

      // Adjust supplier balance(s)
      if (oldSupplierId !== newSupplierId) {
        // Supplier changed: remove old supplier's contribution, add to new supplier
        await tx.supplier.update({
          where: { id: oldSupplierId },
          data: {
            totalAmount: { decrement: oldTotal },
            remainingDebt: { decrement: new Prisma.Decimal(oldTotal).minus(existing.paidAmount) },
          },
        });
        await tx.supplier.update({
          where: { id: newSupplierId },
          data: {
            totalAmount: { increment: newTotal },
            remainingDebt: { increment: newTotal },
          },
        });
      } else if (totalDiff !== 0) {
        // Same supplier, just adjust the diff
        await tx.supplier.update({
          where: { id: oldSupplierId },
          data: {
            totalAmount: { increment: totalDiff },
            remainingDebt: { increment: totalDiff },
          },
        });
      }

      return updated;
    });
  }

  async getAllPurchaseOrders(filters: { search?: string; page?: number; pageSize?: number; status?: string; isPaid?: boolean; dateFrom?: string; dateTo?: string } = {}) {
    const { search, page = 1, pageSize = 10, status, isPaid, dateFrom, dateTo } = filters;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(status && status !== 'ALL' ? { status: status as OrderStatus } : {}),
      ...(search ? {
        orderName: { contains: search }
      } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          expenses: true,
          loans: {
            include: { client: true },
            orderBy: { createdAt: 'desc' },
          },
          items: {
            include: {
              product: true,
            },
          },
          warehouseArrivals: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    const list = orders.map((order) => {
      const orderIsPaid = new Prisma.Decimal(order.totalPrice).equals(order.paidAmount);
      return { ...order, isPaid: orderIsPaid };
    });

    // Apply isPaid filter after computing (MySQL doesn't support computed column filtering)
    const filtered = isPaid !== undefined ? list.filter((o) => o.isPaid === isPaid) : list;

    return { list: filtered, total: isPaid !== undefined ? filtered.length : total };
  }

  async getSupplierBalance(supplierId: number) {
    return await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        totalAmount: true,
        paidAmount: true,
        remainingDebt: true,
      },
    });
  }

  async getDebtSummary(filters: { dateFrom?: string; dateTo?: string } = {}) {
    const { dateFrom, dateTo } = filters;
    const where: Prisma.PurchaseOrderWhereInput = {
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
    };

    const conditions: Prisma.Sql[] = [Prisma.sql`totalPrice > paidAmount`];
    if (dateFrom) conditions.push(Prisma.sql`createdAt >= ${new Date(dateFrom)}`);
    if (dateTo) conditions.push(Prisma.sql`createdAt <= ${new Date(`${dateTo}T23:59:59.999Z`)}`);

    const whereClause = Prisma.join(conditions, ' AND ');

    // Use a single aggregate query instead of loading all rows into JS memory
    const [aggregate, unpaidCount] = await Promise.all([
      prisma.purchaseOrder.aggregate({
        where,
        _sum: {
          totalPrice: true,
          paidAmount: true,
        },
      }),
      // Count orders where paidAmount < totalPrice (debt > 0)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM PurchaseOrder
        WHERE ${whereClause}
      `,
    ]);

    const totalOrderAmount = Number(aggregate._sum.totalPrice ?? 0);
    const totalPaid = Number(aggregate._sum.paidAmount ?? 0);
    const totalDebt = totalOrderAmount - totalPaid;

    return {
      totalDebt: Math.max(0, totalDebt),
      totalPaid,
      unpaidOrdersCount: Number(unpaidCount[0]?.count ?? 0),
    };
  }
  async upsertExpenses(orderId: number, data: {
    tax?: number | null;
    director?: number | null;
    customs?: number | null;
    transportation?: number | null;
    workers?: number | null;
    stockExchange?: number | null;
    forensics?: number | null;
    bank?: number | null;
    textileMinistry?: number | null;
    export?: number | null;
    minusConjugation?: number | null;
    additionalExpenses?: number | null;
  }) {
    return await prisma.purchaseOrderExpenses.upsert({
      where: { purchaseOrderId: orderId },
      update: data,
      create: { purchaseOrderId: orderId, ...data },
    });
  }
}

export const purchaseOrderService = new PurchaseOrderService();
