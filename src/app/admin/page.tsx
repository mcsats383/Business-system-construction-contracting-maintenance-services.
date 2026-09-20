'use client';
import { useEffect, useState } from 'react';

type Job = { id: number; code: string; title: string; status: string; payment?: { amount: string; status: string } | null; client: { name: string }; technician?: { user: { name: string } } | null };
export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]); const [message, setMessage] = useState('');
  async function load() { const r = await fetch('/api/admin/queue', { headers: { 'x-user-id': '3', 'x-user-role': 'ADMIN' } }); if (r.ok) setJobs(await r.json()); else setMessage('ไม่สามารถโหลดข้อมูลได้'); }
  useEffect(() => { load(); }, []);
  async function release(id: number) { const r = await fetch('/api/payments/release', { method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': '3', 'x-user-role': 'ADMIN' }, body: JSON.stringify({ bookingId: id }) }); const data = await r.json(); setMessage(data.message || data.error); load(); }
  return <main className="dashboard"><header><div><div className="tag">ADMIN OPERATIONS</div><h1>คิวตรวจรับและปล่อยเงิน</h1></div><button onClick={load}>รีเฟรช</button></header>{message && <p className="notice">{message}</p>}<div className="job-grid">{jobs.length === 0 ? <p>ไม่มีงานรอดำเนินการ</p> : jobs.map(job => <article className="job" key={job.id}><div className="job-top"><b>{job.code}</b><span className="status">{job.status}</span></div><h2>{job.title}</h2><p>ลูกค้า: {job.client.name}</p><p>ช่าง: {job.technician?.user.name || '-'}</p><p>ยอดเงิน: {job.payment?.amount || '-'} บาท</p>{job.status === 'RELEASE_PENDING' && <button className="release" onClick={() => release(job.id)}>ปล่อยเงินและปิดงาน</button>}</article>)}</div></main>;
}
