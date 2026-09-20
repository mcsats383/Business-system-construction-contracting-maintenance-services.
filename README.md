# RN Rachan Works

**RN Works Platform** — Construction • Maintenance • Assurance

ระบบจัดการงานก่อสร้าง งานซ่อมบำรุง งานตรวจรับ หลักฐานคุณภาพ และ workflow การจัดการเงินค้ำประกัน

## Brand

- **ชื่อแบรนด์:** RN Rachan Works
- **ชื่อระบบ:** RN Works Platform
- **ชื่อเรียกสั้น:** RN Works หรือ Rachan
- **ที่มา:** RN จากผู้ก่อตั้ง และ Rachan จากชื่อ รชานนท์ หน่อนิล
- **คำโปรย:** Construction • Maintenance • Assurance

## Deploy

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

## Required environment

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: random secret of at least 32 characters; never commit it
- `APP_ORIGIN`: exact public HTTPS origin, for example `https://app.example.com`

## Production requirements still outside this repository

- Use HTTPS, a managed PostgreSQL database, backups and monitoring.
- Move uploads from `public/uploads` to private S3-compatible object storage with signed URLs and malware scanning.
- Integrate a real payment provider; never treat a database status update as a bank transfer. Confirm release using provider webhooks and idempotency keys.
- Add a real email/LINE provider with secrets stored in the deployment platform.
- Add rate limiting, centralized logs, alerting, dependency scanning and automated tests.
- Replace demo seed passwords and rotate `SESSION_SECRET` before launch.
