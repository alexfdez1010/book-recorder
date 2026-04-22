import { z } from 'zod';

export const newBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Publication date must be YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  pages: z.coerce.number().int().positive('Pages must be positive'),
  coverUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  language: z.string().min(2, 'Language is required').max(8),
  finishedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Finished-on must be YYYY-MM-DD'),
  externalId: z.string().optional().or(z.literal('')),
  source: z.enum(['openlibrary', 'googlebooks', 'manual']).optional(),
});

export type NewBookForm = z.infer<typeof newBookSchema>;
