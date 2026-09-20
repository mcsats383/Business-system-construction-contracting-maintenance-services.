import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';

export default async function LoginPage() {
  const session = await getSessionFromCookies();
  if (session) {
    if (session.role === 'ADMIN') redirect('/admin');
    if (session.role === 'TECHNICIAN') redirect('/checklist');
    redirect('/approval');
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="tag">ENGINEERING AUDIT SYSTEM</div>
        <h1>เข้าสู่ระบบ</h1>
        <p className="muted">ใช้บัญชีตัวอย่างสำหรับทดสอบระบบ</p>

        <form action="/api/auth/login" method="post" className="auth-form">
          <label>
            อีเมล
            <input name="email" type="email" defaultValue="admin@example.com" required />
          </label>

          <label>
            รหัสผ่าน
            <input name="password" type="password" defaultValue="admin123" required />
          </label>

          <button type="submit">เข้าสู่ระบบ</button>
        </form>

        <div className="demo-box">
          <strong>บัญชี demo:</strong>
          <ul>
            <li>admin@example.com / admin123</li>
            <li>tech@example.com / tech123</li>
            <li>client@example.com / client123</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
