# Engineering Audit & Escrow

ระบบจัดการงานก่อสร้าง/ซ่อมบำรุงที่มี QC, หลักฐานภาพก่อน-หลังและ Escrow workflow

## Login demo

บัญชีตัวอย่างที่ใช้ทดสอบระบบ:
- admin@example.com / admin123
- tech@example.com / tech123
- client@example.com / client123

## Workflow

`HOLD → WAITING_CLIENT_ACCEPTANCE → RELEASE_PENDING → RELEASED`

- ช่างส่ง QC จาก `/checklist`
- ลูกค้าเช็คภาพและตรวจรับจาก `/approval`
- Admin ตรวจคิวและปล่อยเงินจาก `/admin`
- ทุกการเปลี่ยนสถานะถูกบันทึกใน `AuditEvent`

## เริ่มต้นใช้งาน

```bash
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

ไปที่:
- http://localhost:3000/login
- http://localhost:3000/checklist
- http://localhost:3000/approval
- http://localhost:3000/admin

## ข้อจำกัดก่อน Production

เวอร์ชันนี้ใช้งานแบบ session cookie แบบง่ายสำหรับ demo เท่านั้น และยังไม่ได้เชื่อม Auth Provider จริง เช่น NextAuth, Auth.js หรือ SSO แบบ Production ควรย้ายรูปไป Object Storage, เพิ่ม CSRF, rate limit, signed URL, payment provider webhook และ notification provider (LINE OA / Email)
