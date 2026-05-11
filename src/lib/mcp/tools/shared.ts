import { z } from 'zod';
import { LANGUAGE_KEYS } from '@/lib/books/language';
import { BOOK_STATUSES } from '@/lib/books/status';

export const bookFields = {
  title: z.string().min(1),
  author: z.string().min(1),
  pages: z.number().int().positive(),
  category: z.string().min(1),
  language: z.enum(LANGUAGE_KEYS),
  status: z.enum(BOOK_STATUSES).optional(),
  finishedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .optional(),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .optional(),
  coverUrl: z.string().url().optional(),
  externalId: z.string().optional(),
  source: z.enum(['openlibrary', 'googlebooks', 'manual']).optional(),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .describe('Optional 1–5 rating'),
};

export function ok(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  };
}
