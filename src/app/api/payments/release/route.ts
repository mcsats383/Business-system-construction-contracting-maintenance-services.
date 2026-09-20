import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { UserRole } from '@prisma/client';
import { requireRole } from '@/src/lib/auth';

export async function POST(request: Request) {
  const auth = requireRole(request, [UserRole.ADMIN]);
  if (auth.response) return auth.response;

  try {
    const { bookingId } = await request.json();
    const id = Number(bookingId);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'bookingId ไม่ถูกต้อง' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id }, include: { payment: true } });
      if (!booking || booking.status !== 'RELEASE_PENDING' || !booking.payment || booking.payment.status !== 'RELEASE_PENDING') {
        throw new Error('รายการนี้ยังไม่พร้อมปล่อยเงิน');
      }

      await tx.payment.update({ where: { bookingId: id }, data: { status: 'RELEASED' } });
      await tx.booking.update({ where: { id }, data: { status: 'COMPLETED' } });
      await tx.auditEvent.create({ data: { bookingId: id, actorId: auth.user!.id, action: 'PAYMENT_RELEASED' } });
      return { bookingId: id };
    });

    return NextResponse.json({ success: true, ...result, message: 'ปล่อยเงินและปิดงานเรียบร้อย' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }, { status: 400 });
  }
}
