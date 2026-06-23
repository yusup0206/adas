import { OrderStatus, Prisma } from '@prisma/client';
export declare class PurchaseOrderService {
    createPurchaseOrder(data: {
        orderName: string;
        supplierId: number;
        totalPrice: number;
        items: {
            productId: number;
            quantity: number;
            unitPrice: number;
        }[];
    }): Promise<{
        orderName: string;
        totalPrice: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        lastPayDate: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    recordPayment(orderId: number, amount: number, payDate?: string | Date): Promise<{
        orderName: string;
        totalPrice: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        lastPayDate: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    updateOrderStatus(orderId: number, status: OrderStatus): Promise<{
        orderName: string;
        totalPrice: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        lastPayDate: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    deleteOrder(orderId: number): Promise<{
        orderName: string;
        totalPrice: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        lastPayDate: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    updateOrder(orderId: number, data: {
        orderName?: string;
        totalPrice?: number;
        status?: OrderStatus;
    }): Promise<{
        orderName: string;
        totalPrice: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        lastPayDate: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderDate: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        supplierId: number;
    }>;
    getAllPurchaseOrders(filters?: {
        search?: string;
        page?: number;
        pageSize?: number;
        status?: string;
        isPaid?: boolean;
    }): Promise<{
        list: {
            isPaid: boolean;
            supplier: {
                paidAmount: Prisma.Decimal;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name_tm: string;
                name_ru: string;
                totalAmount: Prisma.Decimal;
                remainingDebt: Prisma.Decimal;
            };
            items: ({
                product: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name_tm: string;
                    name_ru: string;
                    unitId: number | null;
                    productionCountry_tm: string;
                    productionCountry_ru: string;
                };
            } & {
                totalPrice: Prisma.Decimal;
                id: number;
                quantity: number;
                unitPrice: Prisma.Decimal;
                productId: number;
                purchaseOrderId: number;
            })[];
            orderName: string;
            totalPrice: Prisma.Decimal;
            paidAmount: Prisma.Decimal;
            lastPayDate: Date | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderDate: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            supplierId: number;
        }[];
        total: number;
    }>;
    getSupplierBalance(supplierId: number): Promise<{
        paidAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        remainingDebt: Prisma.Decimal;
    } | null>;
    getDebtSummary(): Promise<{
        totalDebt: number;
        totalPaid: number;
        unpaidOrdersCount: number;
    }>;
}
export declare const purchaseOrderService: PurchaseOrderService;
