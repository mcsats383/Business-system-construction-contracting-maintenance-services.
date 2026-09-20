import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'engineering_session';

export type SessionUser = {
  id: number;
  role: UserRole;
  email: string;
  name: string;
};

export function encodeSession(user: SessionUser) {
  return Buffer.from(JSON.stringify(user)).toString('base64url');
}

export function decodeSession(raw: string | null): SessionUser | null {
  if (!raw) return null;

  try {
    const value = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(value) as SessionUser;
    if (!parsed.id || !parsed.role || !parsed.email || !parsed.name) return null;
    if (!Object.values(UserRole).includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookieMap = Object.fromEntries(
    cookieHeader.split(';').map((entry) => {
      const [key, ...rest] = entry.trim().split('=');
      return [key, rest.join('=')];
    })
  );

  const sessionCookie = cookieMap[SESSION_COOKIE];
  if (sessionCookie) {
    return decodeSession(sessionCookie);
  }

  const fallbackUserId = Number(request.headers.get('x-user-id'));
  const fallbackRole = request.headers.get('x-user-role') as UserRole | undefined;
  if (Number.isInteger(fallbackUserId) && fallbackRole && Object.values(UserRole).includes(fallbackRole)) {
    return {
      id: fallbackUserId,
      role: fallbackRole,
      email: `${fallbackRole.toLowerCase()}@demo.local`,
      name: fallbackRole.charAt(0) + fallbackRole.slice(1).toLowerCase(),
    };
  }

  return null;
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  return decodeSession(raw);
}

export function requireRole(request: Request, roles: UserRole[]) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 }) };
  }
  if (!roles.includes(user.role)) {
    return { user: null, response: NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 403 }) };
  }
  return { user, response: null };
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}
