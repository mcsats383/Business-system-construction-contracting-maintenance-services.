import { NextResponse } from 'next/server';
import { prisma, ensureUploadDirectory } from '@/src/lib/prisma';
import { writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const runtime = 'nodejs';

const booleanField = z.enum(['true', 'false']).transform(value => value === 'true');
const bodySchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  technicianId: z.coerce.number().int().positive(),
  safety: booleanField, rootCause: booleanField, materialPass: booleanField,
  testingPass: booleanField, cleaned: booleanField,
  engineerNote: z.string().max(5000).optional().default('')
});

async function savePhoto(value: FormDataEntryValue | null, label: string) {
  if (!(value instanceof File) || value.size === 0) throw new Error(`กรุณาแนบรูป${label}`);
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type)) throw new Error('รองรับเฉพาะ JPG, PNG หรือ WebP');
  if (value.size > 8 * 1024 * 1024) throw new Error('รูปภาพต้องมีขนาดไม่เกิน 8MB');
  ensureUploadDirectory();
  const extension = value.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${randomUUID()}-${label}.${extension}`;
  await writeFile(`public/uploads/${filename}`, Buffer.from(await value.arrayBuffer()));
  return `/uploads/${filename}`;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const data = bodySchema.parse(Object.fromEntries(form));
    const beforePhotoUrl = await savePhoto(form.get('beforePhoto'), 'before');
    const afterPhotoUrl = await savePhoto(form.get('afterPhoto'), 'after');
    const checksComplete = data.safety && data.rootCause && data.materialPass && data.testingPass && data.cleaned;
    if (!checksComplete) return NextResponse.json({ error: 'Checklist ต้องครบทุกข้อ' }, { status: 400 });

    const result = await prisma.$transaction(async tx => {
      const booking = await tx.booking.findUnique({ where: { id: data.bookingId }, include: { payment: true } });
      if (!booking || booking.technicianId !== data.technicianId) throw new Error('ไม่พบงานหรือช่างไม่มีสิทธิ์ส่งงานนี้');
      if (!booking.payment || booking.payment.status !== 'HOLD') throw new Error('รายการเงินไม่อยู่ในสถานะ HOLD');
      if (['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(booking.status)) throw new Error('งานนี้ไม่สามารถส่ง QC ซ้ำได้');
      const checklist = await tx.checklist.create({ data: { ...data, bookingId: data.bookingId, technicianId: data.technicianId, safetyChecked: data.safety, rootCauseIdentified: data.rootCause, materialStandardPassed: data.materialPass, leakPressureTested: data.testingPass, siteCleaned: data.cleaned, beforePhotoUrl, afterPhotoUrl } });
      await tx.booking.update({ where: { id: data.bookingId }, data: { status: 'WAITING_CLIENT_ACCEPTANCE' } });
      await tx.auditEvent.create({ data: { bookingId: data.bookingId, actorId: undefined, action: 'QC_SUBMITTED', metadata: { checklistId: checklist.id } } });
      return checklist;
    });
    return NextResponse.json({ success: true, checklistId: result.id, message: 'ส่ง QC แล้ว รอลูกค้าตรวจรับก่อนปล่อยเงิน' }, { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? 'ข้อมูลไม่ถูกต้อง' : error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
