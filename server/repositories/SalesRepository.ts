import type { Sale, SalesDashboard } from '../../shared/sales.js';
import type { SaleDraft } from '../domain/SaleDraft.js';

/** Storage contract: callers do not need to know how sales are persisted. */
export abstract class SalesRepository {
  abstract getDashboard(): Promise<SalesDashboard>;
  abstract recordSale(sale: SaleDraft): Promise<Sale>;
}
