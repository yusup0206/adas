// ── Per-product income breakdown ───────────────────────────────────────────
export interface IncomeProduct {
  productId: number;
  name_tm: string;
  name_ru: string;
  quantitySold: number;
  quantityPurchased: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

// ── Individual sale (WarehouseDispatch) ───────────────────────────────────
export interface IncomeSale {
  id: number;
  date: string;
  productName_tm: string;
  productName_ru: string;
  client: { tm: string; ru: string } | null;
  quantity: number;
  sellPrice: number;
  totalSellPrice: number;
  warehouseType: string;
  note: string;
}

// ── Individual purchase (PurchaseOrderItem) ───────────────────────────────
export interface IncomePurchase {
  id: number;
  orderId: number;
  date: string;
  productName_tm: string;
  productName_ru: string;
  supplier: { tm: string; ru: string } | null;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

// ── Top-level summary ─────────────────────────────────────────────────────
export interface IncomeSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  products: IncomeProduct[];
  sales: IncomeSale[];
  purchases: IncomePurchase[];
}
