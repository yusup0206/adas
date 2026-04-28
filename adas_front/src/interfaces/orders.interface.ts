import type { Supplier } from "./suppliers.interface";

export interface OrderResponse {
  list: Order[];
  total: number;
}

export interface OrderFilters {
  search?: string;
  page?: string;
  pageSize?: string;
  status?: string;
}

export interface Order {
  id: number;
  supplierId: number;
  supplier?: Supplier;
  totalPrice: number;
  paidAmount: number;
  status: "PENDING" | "RECEIVED";
  orderDate: string;
  isPaid: boolean;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  product?: {
    id: number;
    name_tm: string;
    name_ru: string;
    productionCountry_tm?: string;
    productionCountry_ru?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderValues {
  supplierId: number;
  totalPrice: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}
