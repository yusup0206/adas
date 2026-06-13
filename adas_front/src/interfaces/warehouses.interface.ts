export type WarehouseType = 'IMPORT' | 'EXPORT';

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
  productId: number;
  product?: { id: number; name_tm: string; name_ru: string };
  quantity: number;
  sellPrice: number;
  totalSellPrice: number;
  clientId?: number | null;
  client?: { id: number; name_tm: string; name_ru: string } | null;
  note: string;
  dispatchDate: string;
  createdAt: string;
}

export interface WarehouseStockItem {
  productId: number;
  product?: { id: number; name_tm: string; name_ru: string; unit?: { name_tm: string; name_ru: string } | null };
  totalArrived: number;
  totalDispatched: number;
  currentStock: number;
}

export interface ArrivalResponse {
  list: WarehouseArrival[];
  total: number;
}

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
  clientId?: number | null;
  note?: string;
  dispatchDate?: string;
  items: {
    productId: number;
    quantity: number;
    sellPrice: number;
  }[];
}
