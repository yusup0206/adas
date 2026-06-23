export declare class ProductRepository {
    findById(id: number): Promise<({
        unit: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name_tm: string;
            name_ru: string;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        unitId: number | null;
        productionCountry_tm: string;
        productionCountry_ru: string;
    }) | null>;
    getAll(options?: {
        search?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: ({
            unit: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                name_tm: string;
                name_ru: string;
            } | null;
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name_tm: string;
            name_ru: string;
            unitId: number | null;
            productionCountry_tm: string;
            productionCountry_ru: string;
        })[];
        total: number;
    }>;
    create(data: {
        name_tm: string;
        name_ru: string;
        unitId?: number | null;
        productionCountry_tm?: string;
        productionCountry_ru?: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        unitId: number | null;
        productionCountry_tm: string;
        productionCountry_ru: string;
    }>;
    update(id: number, data: {
        name_tm?: string;
        name_ru?: string;
        unitId?: number | null;
        productionCountry_tm?: string;
        productionCountry_ru?: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        unitId: number | null;
        productionCountry_tm: string;
        productionCountry_ru: string;
    }>;
    delete(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name_tm: string;
        name_ru: string;
        unitId: number | null;
        productionCountry_tm: string;
        productionCountry_ru: string;
    }>;
}
export declare const productRepository: ProductRepository;
