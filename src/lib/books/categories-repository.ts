import 'server-only';
import { prisma } from '@/lib/db/prisma';

/** All categories, sorted alphabetically. Powers the picker UI. */
export async function listCategories(): Promise<string[]> {
  const rows = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  return rows.map((r) => r.name);
}

/**
 * Create a category. Idempotent: returns the existing name if one already
 * exists with the same (case-insensitive) name. Trims whitespace.
 */
export async function createCategory(rawName: string): Promise<string> {
  const name = rawName.trim();
  if (!name) throw new Error('Category name is required');
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { name: true },
  });
  if (existing) return existing.name;
  const created = await prisma.category.create({
    data: { name },
    select: { name: true },
  });
  return created.name;
}
