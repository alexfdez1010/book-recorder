import { z } from 'zod';
import { LANGUAGE_KEYS } from './language';
import { opinionSchema, ratingValueSchema } from './validation';

/** A real date-only calendar value; rejects normalized dates such as February 30. */
export const readingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(value);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, 'Enter a valid calendar date');

/** Complete per-reading snapshots; blank opinions and ratings explicitly clear. */
export const readingSchema = z.object({
  finishedOn: readingDateSchema,
  pages: z.coerce.number().int().positive('Pages must be positive'),
  language: z.enum(LANGUAGE_KEYS),
  rating: ratingValueSchema.optional().transform((value) => value ?? null),
  opinion: opinionSchema.transform((value) => value ?? null),
});

/** Client-generated mutation ids make an uncertain create safe to retry. */
export const readingRequestIdSchema = z.string().uuid();
