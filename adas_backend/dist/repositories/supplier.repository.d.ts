export declare class SupplierRepository {
    findById(id: number): Promise<{
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    } | null>;
    getAll(options?: {
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: {
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name_tm: string;
            name_ru: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            remainingDebt: import("@prisma/client/runtime/library").Decimal;
        }[];
        total: number;
    }>;
    create(data: {
        name_tm: string;
        name_ru: string;
    }): Promise<{
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: number, data: {
        name_tm?: string;
        name_ru?: string;
    }): Promise<{
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }>;
    delete(id: number): Promise<{
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateBalance(id: number, data: {
        totalAmount?: number;
        paidAmount?: number;
        remainingDebt?: number;
    }): Promise<{
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }>;
}
export declare const supplierRepository: SupplierRepository;
