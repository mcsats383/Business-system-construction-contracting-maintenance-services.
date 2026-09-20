'use client';
import { useState } from 'react';

export default function ClientApproval({ user, bookingId = 1 }: { user: { name: string; email: string; role: string }; bookingId?: number }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    const response = await fetch('/api/bookings/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ bookingId }),
    });
    const data = await response.json();
    setMessage(data.message || data.error || 'เกิดข้อผิดพลาด');
    setLoading(false);
  }

  return (
    <section className="card">
      <div className="tag">CLIENT ACCEPTANCE</div>
      <h1>ตรวจรับงาน</h1>
      <p className="muted">ผู้ใช้: {user.name} · {user.email}</p>
      <p className="muted">กรุณาตรวจสอบรูป Before/After และรายละเอียดงานก่อนกดยอมรับ</p>
      <button onClick={approve} disabled={loading}>{loading ? 'กำลังบันทึก...' : 'ยอมรับงานและส่งต่อให้ฝ่ายการเงิน'}</button>
      <a href="/api/auth/logout" className="logout-link secondary">ออกจากระบบ</a>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}
