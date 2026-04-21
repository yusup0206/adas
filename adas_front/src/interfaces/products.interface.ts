export interface ProductResponse {
  list: Product[];
  total: number;
}

export interface Product {
  id: number;
  name_tm: string;
  name_ru: string;
  sku: string;
  buyPrice: number;
  sellPrice: number;
  unitId?: number | null;
  unit?: { id: number; name_tm: string; name_ru: string } | null;
  productionCountry_tm: string;
  productionCountry_ru: string;
  warehouseId: number;
  warehouse?: { id: number; name_tm: string; name_ru: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface ProductValues {
  name_tm: string;
  name_ru: string;
  sku: string;
  buyPrice: number;
  sellPrice: number;
  unitId?: number | null;
  productionCountry_tm?: string;
  productionCountry_ru?: string;
  warehouseId: number;
}
