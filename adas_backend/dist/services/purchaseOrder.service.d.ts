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
    updateOrderStatus(orderId: number, status: OrderStatus, arrivalDate: Date, partialItems?: {
        productId: number;
        quantity: number;
    }[]): Promise<{
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
        supplierId?: number;
        totalPrice?: number;
        status?: OrderStatus;
        items?: {
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
    getAllPurchaseOrders(filters?: {
        search?: string;
        page?: number;
        pageSize?: number;
        status?: string;
        isPaid?: boolean;
        dateFrom?: string;
        dateTo?: string;
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
            warehouseArrivals: {
                totalPrice: Prisma.Decimal;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                supplierId: number | null;
                quantity: number;
                unitPrice: Prisma.Decimal;
                productId: number;
                purchaseOrderId: number | null;
                warehouseType: import(".prisma/client").$Enums.WarehouseType;
                clientId: number | null;
                note: string;
                arrivalDate: Date;
            }[];
            expenses: {
                createdAt: Date;
                updatedAt: Date;
                expenses: Prisma.JsonValue;
                id: number;
                purchaseOrderId: number;
            } | null;
            loans: ({
                client: {
                    createdAt: Date;
                    updatedAt: Date;
                    id: number;
                    name_tm: string;
                    name_ru: string;
                    address_tm: string;
                    address_ru: string;
                };
            } & {
                paidAmount: Prisma.Decimal;
                lastPayDate: Date | null;
                status: import(".prisma/client").$Enums.LoanStatus;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                totalAmount: Prisma.Decimal;
                purchaseOrderId: number | null;
                clientId: number;
                note: string;
                type: import(".prisma/client").$Enums.LoanType;
                dispatchId: number | null;
                dispatchGroupId: number | null;
                dispatchName: string;
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
    getDebtSummary(filters?: {
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        totalDebt: number;
        totalPaid: number;
        unpaidOrdersCount: number;
    }>;
    upsertExpenses(orderId: number, data: Record<string, number>): Promise<{
        createdAt: Date;
        updatedAt: Date;
        expenses: Prisma.JsonValue;
        id: number;
        purchaseOrderId: number;
    }>;
}
export declare const purchaseOrderService: PurchaseOrderService;
