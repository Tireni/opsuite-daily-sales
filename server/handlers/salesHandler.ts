import type { ServerResponse } from 'node:http';
import { type Request, body, json, sameOrigin } from '../http.js';
import { authorized } from '../session.js';
import { SaleDraft } from '../domain/SaleDraft.js';
import type { SalesRepository } from '../repositories/SalesRepository.js';

/** Polymorphism: the handler accepts any implementation of SalesRepository. */
export function createSalesHandler(repository: SalesRepository) {
  return async function handler(req: Request, res: ServerResponse) {
    try {
      if (!authorized(req)) return json(res, 403, { error: 'Open the private access link provided by your administrator.' });
      if (req.method === 'GET') return json(res, 200, await repository.getDashboard());
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return json(res, 405, { error: 'Method not allowed.' });
      }
      if (!sameOrigin(req)) return json(res, 403, { error: 'Request not allowed.' });
      let sale: SaleDraft;
      try { sale = SaleDraft.parse(await body(req)); }
      catch (error) { return json(res, 400, { error: error instanceof Error ? error.message : 'Invalid sale.' }); }
      return json(res, 201, await repository.recordSale(sale));
    } catch {
      return json(res, 503, { error: 'The sales database is unavailable. Please try again shortly.' });
    }
  };
}
