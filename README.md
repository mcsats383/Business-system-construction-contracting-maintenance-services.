# Engineering Audit & Escrow

ระบบ MVP สำหรับงานก่อสร้าง/ซ่อมบำรุงที่มี QC, หลักฐานรูปภาพ และ Escrow workflow

## Routes
- `/checklist` — ช่างส่ง Checklist และรูป Before/After
- `/approval` — ลูกค้าตรวจรับงาน (เดโมใช้ client id 1)
- `/admin` — Admin ดูคิวและปล่อยเงิน (เดโมใช้ admin id 3)

## การติดตั้ง
```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Workflow
`HOLD → WAITING_CLIENT_ACCEPTANCE → RELEASE_PENDING → RELEASED`

- ช่างส่ง QC ได้เมื่อมีงานที่มอบหมายและเงินอยู่ `HOLD`
- ลูกค้าต้องตรวจรับก่อนเปลี่ยนเป็น `RELEASE_PENDING`
- Admin จึงปล่อยเงินและปิดงานเป็น `COMPLETED`
- ทุกการเปลี่ยนสถานะสำคัญถูกบันทึกใน `AuditEvent`

## ข้อจำกัดสำคัญก่อน Production
หน้าจอเดโมใช้ header จำลอง (`x-user-id`, `x-user-role`) เท่านั้น ห้ามนำไปใช้กับเงินจริงจนกว่าจะเชื่อมระบบ Login/Session จริง เช่น Auth.js, SSO หรือ JWT ที่มีการตรวจสอบลายเซ็น ฝั่ง production ควรย้ายรูปไป Object Storage, ใช้ signed URL, malware scanning, rate limiting, webhook จาก Payment Provider, dispute policy และ notification provider (LINE OA/Email) ที่มี secret ใน environment
