import type { Client } from "./clients.interface";
import type { Order } from "./orders.interface";

export interface Agreement {
  id: number;
  agreementNumber: string;
  registeredDate: string;
  validDate: string;
  status: "active" | "inactive" | "closed" | string;
  buyerClientId?: number | null;
  sellerClientId?: number | null;
  buyerClient?: Client | null;
  sellerClient?: Client | null;
  purchaseOrders?: Order[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AgreementResponse {
  list: Agreement[];
  total: number;
}

export interface AgreementFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface AgreementValues {
  agreementNumber: string;
  registeredDate?: string;
  validDate?: string;
  status: string;
  buyerClientId?: number | null;
  sellerClientId?: number | null;
  order_ids?: number[];
}
