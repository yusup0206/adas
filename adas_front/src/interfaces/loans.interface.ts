export type LoanType = 'IMPORT' | 'EXPORT';
export type LoanStatus = 'OPEN' | 'PARTIAL' | 'CLOSED';

export interface Loan {
  id: number;
  type: LoanType;
  status: LoanStatus;
  clientId: number;
  client: { id: number; name_tm: string; name_ru: string };
  totalAmount: number;
  paidAmount: number;
  lastPayDate?: string | null;
  note: string;
  dispatchId?: number | null;
  dispatchGroupId?: number | null;
  dispatchName?: string;
  createdAt: string;
  updatedAt: string;
}

/** One row returned by getLoans — represents a full dispatch group (may contain multiple individual loans) */
export interface LoanGroup {
  dispatchGroupId: number;
  dispatchName: string;
  client: { id: number; name_tm: string; name_ru: string };
  totalAmount: number;
  paidAmount: number;
  status: LoanStatus;
  lastPayDate?: string | Date | null;
  items: Loan[];
}

export interface LoanSummary {
  totalDebt: number;
  totalPaid: number;
  openCount: number;
}

export interface LoanGroupResponse {
  list: LoanGroup[];
  total: number;
}

/** @deprecated Use LoanGroupResponse */
export interface LoanResponse {
  list: Loan[];
  total: number;
}
