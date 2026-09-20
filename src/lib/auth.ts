import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export function currentUser(request: Request) {
  const id = Number(request.headers.get('x-user-id'));
  const role = request.headers.get('x-user-role') as UserRole | null;
  if (!Number.isInteger(id) || !role || !Object.values(UserRole).includes(role)) return null;
  return { id, role };
}

export function requireRole(request: Request, roles: UserRole[]) {
  const user = currentUser(request);
  if (!user) return { user: null, response: NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 }) };
  if (!roles.includes(user.role)) return { user: null, response: NextResponse.json({ error: 'ไม่มีสิทธิ์ดำเนินการ' }, { status: 403 }) };
  return { user, response: null };
}
