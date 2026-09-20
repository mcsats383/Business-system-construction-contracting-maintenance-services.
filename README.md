# Server deployment checklist

## Required environment
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: random secret of at least 32 characters; never commit it
- `APP_ORIGIN`: exact public HTTPS origin, for example `https://app.example.com`

## Deploy
```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

For a new database only, use `npx prisma db push` once, then create and commit a migration with `npx prisma migrate dev --name initial` before production. Run `npx prisma db seed` only for a controlled demo/staging environment.

## Production requirements still outside this repository
- Use HTTPS, a managed PostgreSQL database, backups and monitoring.
- Move uploads from `public/uploads` to private S3-compatible object storage with signed URLs and malware scanning.
- Integrate a real payment provider; never treat a database status update as a bank transfer. Confirm release using provider webhooks and idempotency keys.
- Add a real email/LINE provider with secrets stored in the deployment platform.
- Add rate limiting, centralized logs, alerting, dependency scanning and automated tests.
- Replace demo seed passwords and rotate `SESSION_SECRET` before launch.
