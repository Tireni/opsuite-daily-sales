import type { Sale, SalesDashboard, SaleSubmission } from '../../shared/sales';

/** Browser-facing abstraction; React components never construct HTTP requests. */
export interface SalesClient {
  getDashboard(): Promise<SalesDashboard>;
  recordSale(sale: SaleSubmission): Promise<Sale>;
}

export class HttpSalesClient implements SalesClient {
  readonly #fetch: typeof fetch;

  constructor(transport: typeof fetch = globalThis.fetch.bind(globalThis)) {
    this.#fetch = transport;
  }

  async #request<T>(path: string, body?: unknown): Promise<T> {
    const response = await this.#fetch(path, {
      cache: 'no-store',
      ...(body === undefined ? {} : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data as T;
  }

  getDashboard(): Promise<SalesDashboard> {
    return this.#request<SalesDashboard>('/api/sales');
  }

  recordSale(sale: SaleSubmission): Promise<Sale> {
    return this.#request<Sale>('/api/sales', sale);
  }
}

export const salesClient: SalesClient = new HttpSalesClient();
