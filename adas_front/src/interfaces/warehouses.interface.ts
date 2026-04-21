export interface WarehouseResponse {
  list: Warehouse[];
  total: number;
}

export interface Warehouse {
  id: number;
  name_tm: string;
  name_ru: string;
  address_tm: string;
  address_ru: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface WarehouseValues {
  name_tm: string;
  name_ru: string;
  address_tm?: string;
  address_ru?: string;
  location?: string;
}
