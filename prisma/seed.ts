import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const accounts = [
    { name: 'แอดมินระบบ', email: 'admin@example.com', role: UserRole.ADMIN, password: 'admin123' },
    { name: 'ลูกค้าตัวอย่าง', email: 'client@example.com', role: UserRole.CLIENT, password: 'client123' },
    { name: 'ช่างสมชาย', email: 'tech@example.com', role: UserRole.TECHNICIAN, password: 'tech123' },
  ];
  const users = {} as Record<string, { id: number }>;
  for (const account of accounts) users[account.email] = await prisma.user.upsert({ where: { email: account.email }, update: { passwordHash: await hash(account.password, 12), name: account.name, role: account.role }, create: { name: account.name, email: account.email, role: account.role, passwordHash: await hash(account.password, 12) } });
  const technician = await prisma.technician.upsert({ where: { userId: users['tech@example.com'].id }, update: {}, create: { userId: users['tech@example.com'].id } });
  const booking = await prisma.booking.upsert({ where: { code: 'BK-20260920-891' }, update: { clientId: users['client@example.com'].id, technicianId: technician.id }, create: { code: 'BK-20260920-891', clientId: users['client@example.com'].id, technicianId: technician.id, title: 'ซ่อมระบบน้ำรั่ว', address: 'กรุงเทพมหานคร', status: BookingStatus.IN_PROGRESS } });
  await prisma.payment.upsert({ where: { bookingId: booking.id }, update: {}, create: { bookingId: booking.id, amount: 2500, status: PaymentStatus.HOLD } });
  console.log('Seeded production-safe demo accounts and booking');
}
main().finally(() => prisma.$disconnect());
