import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient';

export class PurchaseOrderService {
  async createPurchaseOrder(data: {
    supplierId: number;
    totalPrice: number;
    items: { productId: number; quantity: number; unitPrice: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
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
    return await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { status },
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

  async updateOrder(orderId: number, data: { totalPrice?: number; status?: OrderStatus }) {
    // Basic update logic, adjusting items might be complex and require a separate endpoint
    return await prisma.purchaseOrder.update({
      where: { id: orderId },
      data,
    });
  }

  async getAllPurchaseOrders(filters: { page?: number; pageSize?: number; status?: string } = {}) {
    const { page = 1, pageSize = 10, status } = filters;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.PurchaseOrderWhereInput = status && status !== 'ALL' ? { status: status as OrderStatus } : {};

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
      const isPaid = new Prisma.Decimal(order.totalPrice).equals(order.paidAmount);
      return { ...order, isPaid };
    });

    return { list, total };
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
}

export const purchaseOrderService = new PurchaseOrderService();
