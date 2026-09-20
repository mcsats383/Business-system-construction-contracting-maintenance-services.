import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { UserRole } from '@prisma/client';
import { setSessionCookie } from '@/src/lib/auth';

const DEMO_PASSWORDS: Record<string, string> = {
  'admin@example.com': 'admin123',
  'client@example.com': 'client123',
  'tech@example.com': 'tech123',
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ email: '', password: '' }));
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const validPassword = DEMO_PASSWORDS[email];
    if (!validPassword || validPassword !== password) {
      return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }
    return NextResponse.json({ error: 'ไม่พบผู้ใช้งานในระบบ กรุณา seed database ก่อนเข้าสู่ระบบ' }, { status: 404 });
  }

  const expectedPassword = `${user.role.toLowerCase()}123`;
  if (password !== expectedPassword) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  setSessionCookie(response, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return response;
}
