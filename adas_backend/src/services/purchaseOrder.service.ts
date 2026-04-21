import { OrderType, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../utils/prismaClient';

export class PurchaseOrderService {
  async createPurchaseOrder(data: {
    supplierId: number;
    type: OrderType;
    totalPrice: number;
    durationMonths?: number;
    items: { productId: number; quantity: number; unitPrice: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Purchase Order
      const order = await tx.purchaseOrder.create({
        data: {
          supplierId: data.supplierId,
          type: data.type,
          totalPrice: data.totalPrice,
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

      // 2. Handle Installments if type is INSTALLMENT
      if (data.type === 'INSTALLMENT' && data.durationMonths) {
        const installmentAmount = new Prisma.Decimal(data.totalPrice).div(data.durationMonths);
        
        await tx.paymentPlan.create({
          data: {
            purchaseOrderId: order.id,
            durationMonths: data.durationMonths,
            installments: {
              create: Array.from({ length: data.durationMonths }).map((_, i) => {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i + 1);
                return {
                  amount: installmentAmount,
                  dueDate,
                  status: PaymentStatus.PENDING,
                };
              }),
            },
          },
        });
      }

      // 3. Update Supplier balance
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

  async recordPayment(installmentId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update installment status
      const installment = await tx.installment.update({
        where: { id: installmentId },
        data: {
          status: PaymentStatus.PAID,
          paymentDate: new Date(),
        },
        include: {
          paymentPlan: {
            include: {
              purchaseOrder: true,
            },
          },
        },
      });

      // 2. Update Supplier balance
      await tx.supplier.update({
        where: { id: installment.paymentPlan.purchaseOrder.supplierId },
        data: {
          paidAmount: { increment: installment.amount },
          remainingDebt: { decrement: installment.amount },
        },
      });

      return installment;
    });
  }

  async getAllPurchaseOrders(filters: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 10 } = filters;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
          paymentPlan: {
            include: {
              installments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.purchaseOrder.count(),
    ]);

    const list = orders.map((order) => {
      let isPaid: boolean;
      if (order.type === 'CASH') {
        isPaid = true;
      } else if (order.paymentPlan) {
        const installments = order.paymentPlan.installments;
        isPaid =
          installments.length > 0 && installments.every((i) => i.status === 'PAID');
      } else {
        isPaid = false;
      }
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
