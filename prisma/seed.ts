import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const client = await prisma.user.upsert({ where: { email: 'client@example.com' }, update: {}, create: { name: 'ลูกค้าตัวอย่าง', email: 'client@example.com', role: UserRole.CLIENT } });
  const techUser = await prisma.user.upsert({ where: { email: 'tech@example.com' }, update: {}, create: { name: 'ช่างสมชาย', email: 'tech@example.com', role: UserRole.TECHNICIAN } });
  const technician = await prisma.technician.upsert({ where: { userId: techUser.id }, update: {}, create: { userId: techUser.id } });
  const booking = await prisma.booking.upsert({ where: { code: 'BK-20260920-891' }, update: {}, create: { code: 'BK-20260920-891', clientId: client.id, technicianId: technician.id, title: 'ซ่อมระบบน้ำรั่ว', address: 'กรุงเทพมหานคร', status: BookingStatus.IN_PROGRESS } });
  await prisma.payment.upsert({ where: { bookingId: booking.id }, update: {}, create: { bookingId: booking.id, amount: 2500, status: PaymentStatus.HOLD } });
  console.log(`Seeded booking ${booking.code}`);
}
main().finally(() => prisma.$disconnect());
