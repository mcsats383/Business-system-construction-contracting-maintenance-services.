'use client';
import { FormEvent, useState } from 'react';

const items = [
  ['safety', 'ตรวจสอบความปลอดภัยและตัดระบบไฟ/น้ำ'],
  ['rootCause', 'ระบุและแก้ไขสาเหตุหลักของปัญหา'],
  ['materialPass', 'ใช้วัสดุ/อุปกรณ์ตรงตามมาตรฐาน'],
  ['testingPass', 'ทดสอบการใช้งาน/แรงดัน/การรั่วซึม'],
  ['cleaned', 'ทำความสะอาดและจัดเก็บพื้นที่เรียบร้อย'],
] as const;

export default function ChecklistForm({ user }: { user: { name: string; email: string; role: string } }) {
  const [files, setFiles] = useState<{ before?: File; after?: File }>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bookingId = 1;
  const technicianId = 1;
  const complete = items.every(([key]) => checked[key]) && files.before && files.after;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    if (!complete) {
      setMessage('กรุณาแนบรูปก่อน-หลัง และติ๊ก Checklist ให้ครบ');
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append('bookingId', String(bookingId));
    form.append('technicianId', String(technicianId));
    form.append('beforePhoto', files.before!);
    form.append('afterPhoto', files.after!);
    form.append('engineerNote', note);

    for (const [key] of items) {
      form.append(key, String(Boolean(checked[key])));
    }

    const response = await fetch('/api/engineering-audits', {
      method: 'POST',
      body: form,
      credentials: 'same-origin',
    });

    const result = await response.json();
    setMessage(result.message || result.error || 'เกิดข้อผิดพลาด');
    setLoading(false);
  }

  return (
    <section className="card">
      <div className="tag">ENGINEERING AUDIT & QC</div>
      <h1>ใบตรวจรับงานวิศวกรรม</h1>
      <p className="muted">ผู้ใช้งาน: {user.name} · {user.email}</p>
      <p className="muted">BK-20260920-891 · งานซ่อมระบบน้ำรั่ว</p>
      <a href="/api/auth/logout" className="logout-link secondary">ออกจากระบบ</a>
      <form onSubmit={submit}>
        <h2>1. หลักฐานภาพถ่าย</h2>
        <div className="photos">
          {(['before', 'after'] as const).map((type) => (
            <label className="upload" key={type}>
              {type === 'before' ? 'รูปก่อนซ่อม' : 'รูปหลังซ่อม'}
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(e) => setFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] }))}
              />
              <small>{files[type]?.name || 'แตะเพื่อถ่ายหรือเลือกไฟล์'}</small>
            </label>
          ))}
        </div>

        <h2>2. Checklist มาตรฐาน</h2>
        <div className="checks">
          {items.map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={Boolean(checked[key])}
                onChange={(e) => setChecked((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        <h2>3. หมายเหตุช่าง/วิศวกร</h2>
        <textarea
          maxLength={5000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ข้อสังเกตหรือคำแนะนำเพิ่มเติม"
        />

        <button disabled={!complete || loading}>
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่ง QC เพื่อให้ลูกค้าตรวจรับ'}
        </button>
        {message && <p className="notice">{message}</p>}
      </form>
    </section>
  );
}
