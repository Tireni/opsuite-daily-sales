import type { ServerResponse } from 'node:http';
import { type Request, body, json, sameOrigin } from '../server/http.js';
import { equal, secret, sessionCookie } from '../server/session.js';
export default async function handler(req: Request, res: ServerResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Method not allowed.' }); }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Request not allowed.' });
  try {
    const data = await body(req) as { token?: unknown };
    if (typeof data?.token !== 'string' || !equal(data.token, secret())) return json(res, 403, { error: 'This access link is invalid. Ask your administrator for a current link.' });
    res.setHeader('Set-Cookie', sessionCookie());
    return json(res, 200, { ok: true });
  } catch { return json(res, 400, { error: 'Could not open this access link.' }); }
}
