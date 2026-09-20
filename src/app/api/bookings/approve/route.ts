import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const bookingId = Number(body.bookingId);
  if (!Number.isInteger(bookingId)) return NextResponse.json({ error: 'bookingId ไม่ถูกต้อง' }, { status: 400 });
  const result = await prisma.$transaction(async tx => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
    if (!booking || booking.status !== 'WAITING_CLIENT_ACCEPTANCE' || !booking.payment) throw new Error('งานยังไม่พร้อมให้ตรวจรับ');
    await tx.booking.update({ where: { id: bookingId }, data: { status: 'RELEASE_PENDING' } });
    await tx.payment.update({ where: { bookingId }, data: { status: 'RELEASE_PENDING' } });
    await tx.auditEvent.create({ data: { bookingId, action: 'CLIENT_APPROVED' } });
    return { bookingId };
  });
  return NextResponse.json({ success: true, ...result, message: 'ลูกค้าตรวจรับแล้ว รอระบบปล่อยเงิน' });
}
