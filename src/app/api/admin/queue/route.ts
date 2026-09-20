import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { UserRole } from '@prisma/client';
import { requireRole } from '@/src/lib/auth';

export async function GET(request: Request) {
  const auth = requireRole(request, [UserRole.ADMIN]);
  if (auth.response) return auth.response;

  const bookings = await prisma.booking.findMany({
    where: { status: { in: ['WAITING_CLIENT_ACCEPTANCE', 'RELEASE_PENDING', 'DISPUTED'] } },
    include: {
      client: true,
      technician: { include: { user: true } },
      payment: true,
      checklists: { orderBy: { submittedAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(bookings);
}
