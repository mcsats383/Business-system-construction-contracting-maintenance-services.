import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { UserRole } from '@prisma/client';
import { requireRole } from '@/src/lib/auth';

export async function POST(request: Request) {
  const auth = requireRole(request, [UserRole.CLIENT]);
  if (auth.response) return auth.response;
  try {
    const { bookingId } = await request.json();
    if (!Number.isInteger(Number(bookingId))) return NextResponse.json({ error: 'bookingId ไม่ถูกต้อง' }, { status: 400 });
    const result = await prisma.$transaction(async tx => {
      const booking = await tx.booking.findUnique({ where: { id: Number(bookingId) }, include: { payment: true, checklists: { orderBy: { submittedAt: 'desc' }, take: 1 } } });
      if (!booking || booking.clientId !== auth.user!.id) throw new Error('ไม่พบงานหรือไม่มีสิทธิ์ตรวจรับ');
      if (booking.status !== 'WAITING_CLIENT_ACCEPTANCE' || !booking.payment || booking.payment.status !== 'HOLD') throw new Error('งานยังไม่พร้อมให้ตรวจรับ');
      if (!booking.checklists[0]) throw new Error('ไม่พบรายงาน QC');
      await tx.booking.update({ where: { id: booking.id }, data: { status: 'RELEASE_PENDING' } });
      await tx.payment.update({ where: { bookingId: booking.id }, data: { status: 'RELEASE_PENDING' } });
      await tx.checklist.update({ where: { id: booking.checklists[0].id }, data: { status: 'APPROVED', reviewedById: auth.user!.id, reviewedAt: new Date() } });
      await tx.auditEvent.create({ data: { bookingId: booking.id, actorId: auth.user!.id, action: 'CLIENT_APPROVED' } });
      return { bookingId: booking.id };
    });
    return NextResponse.json({ success: true, ...result, message: 'ตรวจรับแล้ว รอฝ่ายการเงินปล่อยเงิน' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }, { status: 400 });
  }
}
