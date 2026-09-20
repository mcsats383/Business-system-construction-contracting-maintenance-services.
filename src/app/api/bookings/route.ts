import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  const bookings = await prisma.booking.findMany({ include: { payment: true, technician: { include: { user: true } }, checklists: { orderBy: { submittedAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(bookings);
}
