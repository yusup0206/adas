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

  async recordPayment(orderId: number, amount: number) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");

      const updatedOrder = await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
          paidAmount: { increment: amount },
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

  async updateOrderStatus(orderId: number, status: OrderStatus) {
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
          arrivalDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.warehouseArrival.createMany({ data: arrivalData });
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

  async updateOrder(orderId: number, data: { orderName?: string; totalPrice?: number; status?: OrderStatus }) {
    // Basic update logic, adjusting items might be complex and require a separate endpoint
    return await prisma.purchaseOrder.update({
      where: { id: orderId },
      data,
    });
  }

  async getAllPurchaseOrders(filters: { search?: string; page?: number; pageSize?: number; status?: string; isPaid?: boolean } = {}) {
    const { search, page = 1, pageSize = 10, status, isPaid } = filters;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.PurchaseOrderWhereInput = {
      ...(status && status !== 'ALL' ? { status: status as OrderStatus } : {}),
      ...(search ? {
        orderName: { contains: search }
      } : {})
    };

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
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

  async getDebtSummary() {
    // Use a single aggregate query instead of loading all rows into JS memory
    const [aggregate, unpaidCount] = await Promise.all([
      prisma.purchaseOrder.aggregate({
        _sum: {
          totalPrice: true,
          paidAmount: true,
        },
      }),
      // Count orders where paidAmount < totalPrice (debt > 0)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM PurchaseOrder
        WHERE totalPrice > paidAmount
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
}

export const purchaseOrderService = new PurchaseOrderService();
