import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/src/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
  clearSessionCookie(response);
  return response;
}
