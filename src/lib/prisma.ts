import { PrismaClient } from '@prisma/client';
import { existsSync, mkdirSync } from 'node:fs';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function ensureUploadDirectory() {
  const path = 'public/uploads';
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}
