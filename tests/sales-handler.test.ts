import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Sale, SalesDashboard } from '../shared/sales.js';
import { SaleDraft } from '../server/domain/SaleDraft.js';
import { SalesRepository } from '../server/repositories/SalesRepository.js';
import { SupabaseSalesRepository } from '../server/repositories/SupabaseSalesRepository.js';
import type { RpcClient } from '../server/database/SupabaseRpcClient.js';
import { createSalesHandler } from '../server/handlers/salesHandler.js';
import { sessionCookie } from '../server/session.js';

const requestId = '11111111-1111-4111-8111-111111111111';
const saved: Sale = { id: requestId, item: 'Cotton T-shirt', amount_kobo: 1800000, sold_at: '2026-10-13T10:00:00Z' };
const dashboard: SalesDashboard = { day: '2026-10-13', total_kobo: saved.amount_kobo, count: 1, sales: [saved] };

// Test-only subclass: production wiring never imports this file.
class TestSalesRepository extends SalesRepository {
  recorded: SaleDraft[] = [];
  unavailable = false;

  override async getDashboard() {
    if (this.unavailable) throw new Error('Internal database details must not leak');
    return dashboard;
  }

  override async recordSale(sale: SaleDraft) {
    this.recorded.push(sale);
    return saved;
  }
}

test('HTTP handler uses the abstract repository and preserves access, validation, and errors', async t => {
  process.env.INTERNAL_ACCESS_TOKEN = 'handler-test-secret-'.repeat(4);
  const repository = new TestSalesRepository();
  const server = createServer(createSalesHandler(repository));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const headers = { Cookie: sessionCookie().split(';')[0], Origin: base, 'Content-Type': 'application/json' };

  assert.equal((await fetch(base)).status, 403);
  const response = await fetch(base, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), dashboard);
  const invalid = await fetch(base, { method: 'POST', headers, body: JSON.stringify({ item: 'T-shirt', amount: '-1', requestId }) });
  assert.equal(invalid.status, 400);
  assert.equal(repository.recorded.length, 0);
  const crossOrigin = await fetch(base, { method: 'POST', headers: { ...headers, Origin: 'https://example.com' }, body: '{}' });
  assert.equal(crossOrigin.status, 403);
  const result = await fetch(base, { method: 'POST', headers, body: JSON.stringify({ item: ' Cotton T-shirt ', amount: '18000', requestId }) });
  assert.equal(result.status, 201);
  assert.deepEqual(await result.json(), saved);
  assert.equal(repository.recorded[0].item, 'Cotton T-shirt');
  assert.equal(repository.recorded[0].amountKobo, 1800000);

  repository.unavailable = true;
  const failure = await fetch(base, { headers });
  assert.equal(failure.status, 503);
  assert.deepEqual(await failure.json(), { error: 'The sales database is unavailable. Please try again shortly.' });
});

test('Supabase adapter maps validated values to the existing RPC contract', async () => {
  const calls: { name: string; args?: Record<string, unknown> }[] = [];
  const client: RpcClient = {
    async call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
      calls.push({ name, args });
      return (name === 'daily_sales_dashboard' ? dashboard : saved) as T;
    },
  };
  const repository: SalesRepository = new SupabaseSalesRepository(client);
  assert.deepEqual(await repository.getDashboard(), dashboard);
  assert.deepEqual(await repository.recordSale(SaleDraft.parse({ item: ' Cotton T-shirt ', amount: '18000', requestId })), saved);
  assert.deepEqual(calls, [
    { name: 'daily_sales_dashboard', args: undefined },
    { name: 'record_daily_sale', args: { p_item: 'Cotton T-shirt', p_amount_kobo: 1800000, p_request_id: requestId } },
  ]);
});
