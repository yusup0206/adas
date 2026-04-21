import { OrderType, Prisma } from '@prisma/client';
export declare class PurchaseOrderService {
    createPurchaseOrder(data: {
        supplierId: number;
        type: OrderType;
        totalPrice: number;
        durationMonths?: number;
        items: {
            productId: number;
            quantity: number;
            unitPrice: number;
        }[];
    }): Promise<{
        type: import(".prisma/client").$Enums.OrderType;
        totalPrice: Prisma.Decimal;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    recordPayment(installmentId: number): Promise<{
        paymentPlan: {
            purchaseOrder: {
                type: import(".prisma/client").$Enums.OrderType;
                totalPrice: Prisma.Decimal;
                orderDate: Date;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                supplierId: number;
            };
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            durationMonths: number;
            purchaseOrderId: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        paymentPlanId: number;
        amount: Prisma.Decimal;
        dueDate: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        paymentDate: Date | null;
    }>;
    getSupplierBalance(supplierId: number): Promise<{
        totalAmount: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        remainingDebt: Prisma.Decimal;
    } | null>;
}
export declare const purchaseOrderService: PurchaseOrderService;
