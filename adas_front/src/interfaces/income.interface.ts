export interface IncomeProduct {
  productId: number;
  name_tm: string;
  name_ru: string;
  sku: string;
  buyPrice: number;
  sellPrice: number;
  totalQuantity: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface IncomeTransaction {
  id: number;
  orderId: number;
  date: string;
  supplier: { tm: string; ru: string };
  productName_tm: string;
  productName_ru: string;
  sku: string;
  quantity: number;
  cost: number;
  revenue: number;
  profit: number;
}

export interface IncomeSummary {
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  products: IncomeProduct[];
  transactions: IncomeTransaction[];
}
