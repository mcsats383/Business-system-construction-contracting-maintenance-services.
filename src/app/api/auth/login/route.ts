import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { setSessionCookie, requireSameOrigin } from '@/src/lib/auth';
import { compare } from 'bcryptjs';
import { z } from 'zod';

const credentials = z.object({ email: z.string().email().max(254).transform(v => v.toLowerCase().trim()), password: z.string().min(8).max(128) });

export async function POST(request: Request) {
  const csrf = requireSameOrigin(request); if (csrf) return csrf;
  const input = request.headers.get('content-type')?.includes('application/json') ? await request.json().catch(() => ({})) : Object.fromEntries(await request.formData());
  const parsed = credentials.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  setSessionCookie(response, { id: user.id, name: user.name, email: user.email, role: user.role });
  return response;
}
