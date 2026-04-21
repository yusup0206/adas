import type { Supplier } from "./suppliers.interface";

export interface OrderResponse {
  list: Order[];
  total: number;
}

export interface OrderFilters {
  search?: string;
  page?: string;
  pageSize?: string;
}

export interface Order {
  id: number;
  supplierId: number;
  supplier?: Supplier;
  type: "CASH" | "INSTALLMENT";
  totalPrice: number;
  orderDate: string;
  isPaid: boolean;
  items: OrderItem[];
  paymentPlan?: any;
}

export interface OrderItem {
  id: number;
  productId: number;
  product?: {
    id: number;
    name_tm: string;
    name_ru: string;
    sku: string;
    buyPrice: number;
    sellPrice: number;
    productionCountry_tm?: string;
    productionCountry_ru?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderValues {
  supplierId: number;
  type: "CASH" | "INSTALLMENT";
  totalPrice: number;
  durationMonths?: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}
