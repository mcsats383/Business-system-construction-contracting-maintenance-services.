# Engineering Audit & Escrow

MVP สำหรับระบบงานก่อสร้าง/ซ่อมบำรุง: ช่างส่ง Checklist และรูป Before/After จากมือถือ แล้วงานจะเข้าสถานะ `WAITING_CLIENT_ACCEPTANCE` โดย **ยังไม่ปล่อยเงินทันที** ลูกค้าต้องตรวจรับก่อน

## สิ่งที่ทำไว้
- Next.js + TypeScript + PostgreSQL + Prisma
- Schema สำหรับ users, technicians, bookings, payments, checklists และ audit events
- ตรวจชนิด/ขนาดรูปภาพและบันทึกไฟล์ใน `public/uploads` สำหรับ development
- Transaction เดียวสำหรับบันทึก QC และเปลี่ยนสถานะงาน
- Workflow: `HOLD → RELEASE_PENDING` หลังลูกค้ากดอนุมัติ
- หน้าฟอร์มมือถือสำหรับรูปก่อน/หลังและ Checklist 5 รายการ

## เริ่มใช้งาน
```bash
cp .env.example .env
# แก้ DATABASE_URL ให้ชี้ไป PostgreSQL
npm install
npm run db:push
npm run db:seed
npm run dev
```
เปิด `http://localhost:3000/checklist`

## หมายเหตุ Production
เวอร์ชันนี้เป็น MVP ที่พร้อมต่อยอด ไม่ควรใช้ปล่อยเงินจริงทันทีโดยไม่มีระบบ Login/Role-based access, Object Storage (S3-compatible), malware scanning, signed URLs, rate limiting, CSRF protection, payment provider webhook และการอนุมัติจากฝ่ายการเงิน การอัปโหลดใน `public/uploads` เหมาะเฉพาะ development หรือเซิร์ฟเวอร์แบบ persistent เท่านั้น

ก่อน Production ควรเพิ่มการยืนยันตัวตนจาก session แทนการรับ `technicianId` จาก form, ย้ายรูปไป Object Storage, เพิ่ม dispute/auto-release policy และทำ integration tests สำหรับสถานะการเงิน
