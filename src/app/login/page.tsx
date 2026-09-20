import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';
import LoginForm from '@/src/components/LoginForm';
export default async function LoginPage() { const session = await getSessionFromCookies(); if (session) redirect(session.role === 'ADMIN' ? '/admin' : session.role === 'TECHNICIAN' ? '/checklist' : '/approval'); return <main className="auth-shell"><section className="auth-card"><div className="tag">ENGINEERING AUDIT SYSTEM</div><h1>เข้าสู่ระบบ</h1><p className="muted">ระบบตรวจรับงานและจัดการเงินค้ำประกัน</p><LoginForm /><div className="demo-box"><strong>บัญชีทดสอบหลัง seed:</strong><ul><li>admin@example.com / admin123</li><li>tech@example.com / tech123</li><li>client@example.com / client123</li></ul></div></section></main>; }
