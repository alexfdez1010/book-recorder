import { z } from 'zod';
import { LANGUAGE_KEYS } from './language';
import { BOOK_STATUSES } from './status';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const ratingSchema = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z.coerce
    .number()
    .min(0.5, 'Rating 0.5–5')
    .max(5, 'Rating 0.5–5')
    .multipleOf(0.5, 'Rating must be in 0.5 steps')
    .optional(),
);

/** Normalizes an optional opinion, treating blank input as absent. */
export const opinionSchema = z.preprocess(
  (value) =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
      ? undefined
      : value,
  z
    .string()
    .trim()
    .max(10_000, 'Opinion must be 10,000 characters or less')
    .optional(),
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
    opinion: opinionSchema,
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
  z.union([z.coerce.number().min(0.5).max(5).multipleOf(0.5), z.null()]),
);
