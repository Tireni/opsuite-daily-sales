export interface Sale {
  id: string;
  item: string;
  amount_kobo: number;
  sold_at: string;
}

export interface SalesDashboard {
  day: string;
  total_kobo: number;
  today_count: number;
  count: number;
  sales: Sale[];
}

export interface SaleSubmission {
  item: string;
  amount: string;
  requestId: string;
}
