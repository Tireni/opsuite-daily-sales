import type { IncomingMessage, ServerResponse } from 'node:http';
export type Request = IncomingMessage & { body?: unknown };

export function json(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}

export function sameOrigin(req: Request) {
  if (!req.headers.origin) return false;
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}

export async function body(req: Request): Promise<unknown> {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new Error('Send a JSON request.');
  if (Number(req.headers['content-length']) > 4096) throw new Error('Request too large.');
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  let content = '';
  for await (const part of req) {
    content += part.toString();
    if (Buffer.byteLength(content) > 4096) throw new Error('Request too large.');
  }
  try { return JSON.parse(content); } catch { throw new Error('Send a valid JSON request.'); }
}
