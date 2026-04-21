export interface SupplierResponse {
  list: Supplier[];
  total: number;
}

export interface Supplier {
  id: number;
  name_tm: string;
  name_ru: string;
  totalAmount: number;
  paidAmount: number;
  remainingDebt: number;
}

export interface SupplierFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface SupplierValues {
  name_tm: string;
  name_ru: string;
}
