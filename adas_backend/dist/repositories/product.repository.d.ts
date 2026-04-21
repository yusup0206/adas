export declare class ProductRepository {
    findById(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        sku: string;
        price: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number;
    } | null>;
    getAll(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        sku: string;
        price: import("@prisma/client/runtime/library").Decimal;
        warehouseId: number;
    }[]>;
}
export declare const productRepository: ProductRepository;
