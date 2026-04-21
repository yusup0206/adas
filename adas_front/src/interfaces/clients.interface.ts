export interface ClientResponse {
  list: Client[];
  total: number;
}

export interface Client {
  id: number;
  name_tm: string;
  name_ru: string;
  directorName_tm: string;
  directorName_ru: string;
  address_tm: string;
  address_ru: string;
  bankName_tm: string;
  bankName_ru: string;
  swift: string;
  accountNo: string;
  currentAccount: string;
  correspondentAccount: string;
  bankIdCode: string;
  individualIdNumber: string;
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
  directorName_tm?: string;
  directorName_ru?: string;
  address_tm?: string;
  address_ru?: string;
  bankName_tm?: string;
  bankName_ru?: string;
  swift?: string;
  accountNo?: string;
  currentAccount?: string;
  correspondentAccount?: string;
  bankIdCode?: string;
  individualIdNumber?: string;
}