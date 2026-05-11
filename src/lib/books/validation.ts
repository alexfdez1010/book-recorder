import { z } from 'zod';
import { LANGUAGE_KEYS } from './language';
import { BOOK_STATUSES } from './status';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const ratingSchema = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().min(1, 'Rating 1–5').max(5, 'Rating 1–5').optional(),
);

export const newBookSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    publicationDate: z
      .string()
      .regex(dateRegex, 'Publication date must be YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    pages: z.coerce.number().int().positive('Pages must be positive'),
    coverUrl: z.string().url().optional().or(z.literal('')),
    category: z.string().min(1, 'Category is required'),
    language: z.enum(LANGUAGE_KEYS),
    status: z.enum(BOOK_STATUSES).default('finished'),
    finishedOn: z
      .string()
      .regex(dateRegex, 'Finished-on must be YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    externalId: z.string().optional().or(z.literal('')),
    source: z.enum(['openlibrary', 'googlebooks', 'manual']).optional(),
    rating: ratingSchema,
  })
  .refine(
    (d) => d.status !== 'finished' || (d.finishedOn && d.finishedOn !== ''),
    {
      message: 'Finished-on is required for finished books',
      path: ['finishedOn'],
    },
  );

export type NewBookForm = z.infer<typeof newBookSchema>;

export const markFinishedSchema = z.object({
  finishedOn: z.string().regex(dateRegex, 'Finished-on must be YYYY-MM-DD'),
  rating: ratingSchema,
});

export const ratingValueSchema = z.preprocess(
  (v) => (v === '' || v === null ? null : v),
  z.union([z.coerce.number().int().min(1).max(5), z.null()]),
);
