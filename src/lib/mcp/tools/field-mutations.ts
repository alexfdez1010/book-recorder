import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  deleteBook,
  setBookOpinion,
  setBookRating,
} from '@/lib/books/repository';
import { createCategory } from '@/lib/books/categories-repository';
import { ok } from './shared';

/** Register focused field updates and small library maintenance commands. */
export function registerFieldMutationTools(server: McpServer): void {
  server.registerTool(
    'set_rating',
    {
      title: 'Set or clear a book rating',
      description:
        'Set the 0.5–5 star rating (half-star steps) for a book by id. Pass `rating: null` to clear it.',
      inputSchema: {
        id: z.string().min(1),
        rating: z.union([z.number().min(0.5).max(5).multipleOf(0.5), z.null()]),
      },
    },
    async ({ id, rating }) => ok(await setBookRating(id, rating)),
  );

  server.registerTool(
    'set_opinion',
    {
      title: 'Set or clear a book opinion',
      description:
        "Set the reader's optional opinion for a book by id. Pass `opinion: null` or blank text to clear it.",
      inputSchema: {
        id: z.string().min(1),
        opinion: z.string().trim().max(10_000).nullable(),
      },
    },
    async ({ id, opinion }) => ok(await setBookOpinion(id, opinion || null)),
  );

  server.registerTool(
    'add_category',
    {
      title: 'Create a category',
      description:
        'Register a new category so it appears in the picker. Idempotent: returns the existing name if one already exists (case-insensitive).',
      inputSchema: { name: z.string().min(1) },
    },
    async ({ name }) => ok({ name: await createCategory(name) }),
  );

  server.registerTool(
    'delete_book',
    {
      title: 'Delete a book',
      description: 'Permanently delete a book record by id.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => {
      await deleteBook(id);
      return ok({ deleted: id });
    },
  );
}
