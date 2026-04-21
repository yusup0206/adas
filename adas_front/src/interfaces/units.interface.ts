export interface UnitResponse {
  list: Unit[];
  total: number;
}

export interface Unit {
  id: number;
  name_tm: string;
  name_ru: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface UnitValues {
  name_tm: string;
  name_ru: string;
}