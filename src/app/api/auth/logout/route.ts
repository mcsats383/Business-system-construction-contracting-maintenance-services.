import { NextResponse } from 'next/server';
import { clearSessionCookie, requireSameOrigin } from '@/src/lib/auth';
export async function POST(request: Request) { const csrf = requireSameOrigin(request); if (csrf) return csrf; const response = NextResponse.json({ success: true }); clearSessionCookie(response); return response; }
export async function GET(request: Request) { const response = NextResponse.redirect(new URL('/login', process.env.APP_ORIGIN || 'http://localhost:3000')); clearSessionCookie(response); return response; }
