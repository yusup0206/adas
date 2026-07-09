export type WarehouseType = "IMPORT" | "EXPORT";

export interface WarehouseArrival {
  id: number;
  warehouseType: WarehouseType;
  productId: number;
  product?: { id: number; name_tm: string; name_ru: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId?: number | null;
  supplier?: { id: number; name_tm: string; name_ru: string } | null;
  purchaseOrderId?: number | null;
  purchaseOrder?: { id: number } | null;
  clientId?: number | null;
  client?: { id: number; name_tm: string; name_ru: string } | null;
  note: string;
  arrivalDate: string;
  createdAt: string;
}

export interface WarehouseDispatch {
  id: number;
  warehouseType: WarehouseType;
  dispatchName: string;
  dispatchGroupId?: number | null;
  productId: number;
  product?: {
    id: number;
    name_tm: string;
    name_ru: string;
    unit?: { name_tm: string; name_ru: string } | null;
  };
  quantity: number;
  sellPrice: number;
  totalSellPrice: number;
  clientId?: number | null;
  client?: { id: number; name_tm: string; name_ru: string } | null;
  note: string;
  dispatchDate: string;
  createdAt: string;
}

export interface DispatchGroup {
  dispatchGroupId: number;
  dispatchName: string;
  dispatchDate: string;
  client?: { id: number; name_tm: string; name_ru: string } | null;
  totalSellPrice: number;
  itemCount: number;
  items: WarehouseDispatch[];
}

export interface WarehouseStockItem {
  productId: number;
  product?: {
    id: number;
    name_tm: string;
    name_ru: string;
    unit?: { name_tm: string; name_ru: string } | null;
  };
  totalArrived: number;
  totalDispatched: number;
  currentStock: number;
}

export interface ArrivalResponse {
  list: WarehouseArrival[];
  total: number;
}

export interface DispatchGroupResponse {
  list: DispatchGroup[];
  total: number;
}

/** @deprecated Use DispatchGroupResponse */
export interface DispatchResponse {
  list: WarehouseDispatch[];
  total: number;
}

export interface CreateArrivalValues {
  warehouseType: WarehouseType;
  productId: number;
  quantity: number;
  unitPrice: number;
  supplierId?: number | null;
  purchaseOrderId?: number | null;
  clientId?: number | null;
  note?: string;
  arrivalDate?: string;
}

export interface CreateDispatchValues {
  warehouseType: WarehouseType;
  dispatchName?: string;
  clientId?: number | null;
  note?: string;
  dispatchDate?: string;
  isLoan?: boolean;
  purchaseOrderId?: number | null;
  items: {
    productId: number;
    quantity: number;
    sellPrice: number;
  }[];
}
