import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from './http.js';

export function secret() {
  const value = process.env.INTERNAL_ACCESS_TOKEN;
  if (!value || value.length < 32) throw new Error('Access configuration missing');
  return value;
}

export function equal(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(expiry: string) {
  return createHmac('sha256', secret()).update(`opsuite-session:${expiry}`).digest('hex');
}

export function sessionCookie() {
  const expiry = String(Math.floor(Date.now() / 1000) + 2592000);
  return `opsuite_session=${expiry}.${sign(expiry)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${process.env.VERCEL ? '; Secure' : ''}`;
}

export function authorized(req: Request) {
  const cookie = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('opsuite_session='))?.slice(16);
  if (!cookie) return false;
  const [expiry, signature] = cookie.split('.');
  return /^\d+$/.test(expiry) && Number(expiry) > Date.now() / 1000 && !!signature && equal(signature, sign(expiry));
}
