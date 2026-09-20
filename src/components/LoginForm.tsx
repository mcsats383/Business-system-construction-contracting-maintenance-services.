'use client';
import { FormEvent, useState } from 'react';
export default function LoginForm() {
  const [email, setEmail] = useState('admin@example.com'); const [password, setPassword] = useState('admin123'); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setLoading(true); setError(''); const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ email, password }) }); const data = await response.json(); if (!response.ok) { setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ'); setLoading(false); return; } window.location.href = data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'TECHNICIAN' ? '/checklist' : '/approval'; }
  return <form onSubmit={submit} className="auth-form"><label>อีเมล<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label><label>รหัสผ่าน<input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={8} required /></label><button disabled={loading}>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>{error && <p className="notice">{error}</p>}</form>;
}
