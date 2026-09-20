'use client';
import { useEffect, useState } from 'react';

type Job = {
  id: number;
  code: string;
  title: string;
  status: string;
  payment?: { amount: string; status: string } | null;
  client: { name: string };
  technician?: { user: { name: string } } | null;
};

export default function AdminDashboard({ user }: { user: { name: string; email: string; role: string } }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch('/api/admin/queue', { credentials: 'same-origin' });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      return;
    }
    setJobs(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function release(id: number) {
    const response = await fetch('/api/payments/release', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ bookingId: id }),
    });

    const data = await response.json();
    setMessage(data.message || data.error || 'เกิดข้อผิดพลาด');
    await load();
  }

  return (
    <main className="dashboard">
      <header>
        <div>
          <div className="tag">ADMIN OPERATIONS</div>
          <h1>คิวตรวจรับและปล่อยเงิน</h1>
          <p className="muted">ผู้ใช้งาน: {user.name} · {user.email}</p>
        </div>
        <a href="/api/auth/logout" className="logout-link">ออกจากระบบ</a>
      </header>
      {message && <p className="notice">{message}</p>}
      <div className="job-grid">
        {jobs.length === 0 ? (
          <p>ไม่มีงานรอดำเนินการ</p>
        ) : (
          jobs.map((job) => (
            <article className="job" key={job.id}>
              <div className="job-top">
                <b>{job.code}</b>
                <span className="status">{job.status}</span>
              </div>
              <h2>{job.title}</h2>
              <p>ลูกค้า: {job.client.name}</p>
              <p>ช่าง: {job.technician?.user.name || '-'}</p>
              <p>ยอดเงิน: {job.payment?.amount || '-'} บาท</p>
              {job.status === 'RELEASE_PENDING' && (
                <button className="release" onClick={() => release(job.id)}>ปล่อยเงินและปิดงาน</button>
              )}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
