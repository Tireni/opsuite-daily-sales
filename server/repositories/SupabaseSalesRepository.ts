import type { Sale, SalesDashboard } from '../../shared/sales.js';
import type { RpcClient } from '../database/SupabaseRpcClient.js';
import type { SaleDraft } from '../domain/SaleDraft.js';
import { SalesRepository } from './SalesRepository.js';

/** Inherits the storage contract and implements it using real Supabase RPCs. */
export class SupabaseSalesRepository extends SalesRepository {
  readonly #client: RpcClient;

  constructor(client: RpcClient) {
    super();
    this.#client = client;
  }

  override getDashboard(): Promise<SalesDashboard> {
    return this.#client.call<SalesDashboard>('daily_sales_dashboard');
  }

  override recordSale(sale: SaleDraft): Promise<Sale> {
    return this.#client.call<Sale>('record_daily_sale', {
      p_item: sale.item,
      p_amount_kobo: sale.amountKobo,
      p_request_id: sale.requestId,
    });
  }
}
