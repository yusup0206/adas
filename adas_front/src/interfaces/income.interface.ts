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
  orderName: string;
  date: string;
  productName_tm: string;
  productName_ru: string;
  supplier: { tm: string; ru: string } | null;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  expensesTotal: number;
}

// ── Loan Repayment ────────────────────────────────────────────────────────
export interface IncomeLoanRepayment {
  id: number;
  type: "IMPORT" | "EXPORT";
  client: { tm: string; ru: string } | null;
  paidAmount: number;
  lastPayDate: string | null;
  purchaseOrderId: number | null;
  purchaseOrderName: string | null;
}

// ── Order-based income breakdown ───────────────────────────────────────────
export interface IncomeOrder {
  id: number;
  orderName: string;
  orderDate: string;
  supplier: { tm: string; ru: string } | null;
  itemsCost: number;
  expensesTotal: number;
  expensesBreakdown: Record<string, number>;
  totalCost: number;
  importDirectCashSales: number;
  importLoanCashRepayments: number;
  barterReceivedTotal: number;
  exportSales: number;
  totalRevenue: number;
  totalProfit: number;
  status: string;
}

// ── Top-level summary ─────────────────────────────────────────────────────
export interface IncomeSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  orders: IncomeOrder[];
  products: IncomeProduct[];
  sales: IncomeSale[];
  purchases: IncomePurchase[];
  loanRepayments: IncomeLoanRepayment[];
}
