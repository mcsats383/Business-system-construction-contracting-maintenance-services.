import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'engineering_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = { id: number; role: UserRole; email: string; name: string; exp: number };
export type SessionUser = Omit<SessionPayload, 'exp'>;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  return value;
}
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function encode(payload: SessionPayload) { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return `${body}.${sign(body)}`; }

export function decodeSession(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    const [body, signature] = raw.split('.');
    if (!body || !signature) return null;
    const expected = Buffer.from(sign(body));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.id || !payload.email || !payload.name || !Object.values(UserRole).includes(payload.role) || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.id, role: payload.role, email: payload.email, name: payload.name };
  } catch { return null; }
}

export function getSessionFromRequest(request: Request) {
  const raw = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) ?? null;
  return decodeSession(raw);
}
export async function getSessionFromCookies() { return decodeSession((await cookies()).get(SESSION_COOKIE)?.value ?? null); }

export function requireRole(request: Request, roles: UserRole[]) {
  const user = getSessionFromRequest(request);
  if (!user) return { user: null, response: NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 }) };
  if (!roles.includes(user.role)) return { user: null, response: NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 403 }) };
  return { user, response: null };
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.APP_ORIGIN;
  if (origin && expected && origin !== expected) return NextResponse.json({ error: 'คำขอไม่ปลอดภัย' }, { status: 403 });
  return null;
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  const payload = { ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  response.cookies.set(SESSION_COOKIE, encode(payload), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_TTL_SECONDS });
}
export function clearSessionCookie(response: NextResponse) { response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 }); }
