import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromCookies, SESSION_COOKIE } from '@/src/lib/auth';
import { redirect } from 'next/navigation';

export default async function LogoutPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');
  const response = NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
  clearSessionCookie(response);
  return response;
}
