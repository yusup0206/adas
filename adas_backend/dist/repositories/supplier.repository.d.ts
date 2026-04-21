export declare class SupplierRepository {
    findById(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    } | null>;
    getAll(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    updateBalance(id: number, data: {
        totalAmount?: number;
        paidAmount?: number;
        remainingDebt?: number;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        remainingDebt: import("@prisma/client/runtime/library").Decimal;
    }>;
}
export declare const supplierRepository: SupplierRepository;
