export interface ClientResponse {
  list: Client[];
  total: number;
}

export interface Client {
  id: number;
  name_tm: string;
  name_ru: string;
  address_tm: string;
  address_ru: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface ClientValues {
  name_tm: string;
  name_ru: string;
  address_tm?: string;
  address_ru?: string;
}