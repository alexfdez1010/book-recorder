import 'server-only';
import { PrismaClient } from '../../../generated/prisma';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;
