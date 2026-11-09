import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import {
  createBook,
  markBookAsFinished,
  setBookOpinion,
  setBookRating,
  updateBook,
} from '@/lib/books/repository';
import {
  deleteReading,
  listFinishedReadings,
  readingOrder,
  recordReread,
  updateReading,
} from '@/lib/books/readings-repository';
import type { NewBookInput } from '@/lib/books/repository';

const ids: string[] = [];
const input: NewBookInput = {
  title: 'Reading persistence fixture',
  author: 'Reading fixture',
  publicationDate: new Date('1960-01-01'),
  pages: 300,
  coverUrl: null,
  category: 'Fiction',
  language: 'en',
  status: 'finished',
  finishedOn: new Date('2020-03-01'),
  rating: 3.5,
  opinion: 'First opinion\nCafé y corazón',
  externalId: 'fixture',
  source: 'manual',
};
const reread = {
  finishedOn: new Date('2026-11-01'),
  pages: 400,
  language: 'es',
  rating: null,
  opinion: null,
};

/** Creates an owned fixture without touching any existing library records. */
async function fixture(overrides: Partial<NewBookInput> = {}) {
  const book = await createBook({ ...input, ...overrides });
  ids.push(book.id);
  return book;
}

beforeAll(() => {
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    !url.pathname.endsWith('_test')
  )
    throw new Error(
      'Database tests require an explicitly local *_test database',
    );
});

afterAll(async () => {
  await prisma.book.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

describe('transactional reading persistence', () => {
  it('preserves the exact legacy create result, including timestamps', async () => {
    const book = await fixture();
    expect(await prisma.book.findUnique({ where: { id: book.id } })).toEqual(
      book,
    );
  });
  it('serializes distinct concurrent additions and never allows simultaneous removals to erase the final reading', async () => {
    const book = await fixture();
    await Promise.all([
      recordReread(book.id, crypto.randomUUID(), reread),
      recordReread(book.id, crypto.randomUUID(), reread),
    ]);
    const readings = await prisma.reading.findMany({
      where: { bookId: book.id },
    });
    expect(readings).toHaveLength(3);
    const removals = await Promise.allSettled(
      readings.map((reading) => deleteReading(book.id, reading.id)),
    );
    expect(
      removals.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(2);
    expect(
      removals.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(1);
  });
  it('creates a first reading through the legacy writer and promotes a queue once', async () => {
    const book = await fixture({ status: 'to-read', finishedOn: null });
    expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(0);
    await markBookAsFinished(book.id, new Date('2026-01-10'));
    await markBookAsFinished(book.id, new Date('2026-02-11'), 5);
    const readings = await prisma.reading.findMany({
      where: { bookId: book.id },
    });
    expect(readings).toHaveLength(1);
    expect(readings[0]).toMatchObject({
      finishedOn: new Date('2026-01-10'),
      opinion: input.opinion,
      rating: input.rating,
    });
  });

  it('preserves every original field while adding a different edition and backdated reading', async () => {
    const book = await fixture();
    const first = await prisma.reading.findFirstOrThrow({
      where: { bookId: book.id },
    });
    const latest = await recordReread(book.id, crypto.randomUUID(), reread);
    await recordReread(book.id, crypto.randomUUID(), {
      ...reread,
      finishedOn: new Date('2022-01-02'),
      pages: 320,
    });
    expect(
      await prisma.reading.findUnique({ where: { id: first.id } }),
    ).toEqual(first);
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      finishedOn: latest.finishedOn,
      rating: null,
      opinion: null,
      pages: 400,
      language: 'es',
      externalId: 'fixture',
    });
    const entries = (await listFinishedReadings()).filter(
      (entry) => entry.id === book.id,
    );
    expect(entries).toHaveLength(3);
    expect(entries.reduce((total, entry) => total + entry.pages, 0)).toBe(1020);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(1);
  });

  it('deduplicates repeated and concurrent requests without overwriting the original payload', async () => {
    const book = await fixture();
    const id = crypto.randomUUID();
    const [a, b] = await Promise.all([
      recordReread(book.id, id, reread),
      recordReread(book.id, id, { ...reread, opinion: 'Changed retry' }),
    ]);
    expect(a).toEqual(b);
    expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(2);
    expect(await recordReread(book.id, id, { ...reread, rating: 5 })).toEqual(
      a,
    );
    const other = await fixture();
    await expect(recordReread(other.id, id, reread)).rejects.toThrow(
      'another book',
    );
  });

  it('retains distinct same-day rereads and uses stable chronology when dates are edited', async () => {
    const book = await fixture();
    const first = await prisma.reading.findFirstOrThrow({
      where: { bookId: book.id },
    });
    const one = await recordReread(book.id, crypto.randomUUID(), reread);
    await recordReread(book.id, crypto.randomUUID(), {
      ...reread,
      opinion: 'Same day, different reading',
    });
    const ordered = await prisma.reading.findMany({
      where: { bookId: book.id },
      orderBy: readingOrder,
    });
    expect(ordered).toHaveLength(3);
    const newest = ordered[0];
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({ opinion: newest.opinion });
    await updateReading(book.id, newest.id, {
      ...reread,
      finishedOn: new Date('2019-01-01'),
      opinion: 'Backdated',
    });
    const remaining = ordered.find(
      (reading) => reading.id !== newest.id && reading.id !== first.id,
    )!;
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      finishedOn: remaining.finishedOn,
      opinion: remaining.opinion,
    });
    expect(
      await prisma.reading.findUnique({ where: { id: first.id } }),
    ).toEqual(first);
    expect(one.bookId).toBe(book.id);
  });

  it('edits an older reading and shared metadata without corrupting later snapshots', async () => {
    const book = await fixture();
    const first = await prisma.reading.findFirstOrThrow({
      where: { bookId: book.id },
    });
    const latest = await recordReread(book.id, crypto.randomUUID(), reread);
    const { externalId: _externalId, source: _source, ...editable } = input;
    void _externalId;
    void _source;
    await updateBook(
      book.id,
      {
        ...editable,
        title: 'Corrected shared title',
        pages: 301,
        language: 'fr',
        opinion: 'Corrected first opinion',
      },
      first.id,
    );
    expect(
      await prisma.reading.findUnique({ where: { id: latest.id } }),
    ).toEqual(latest);
    expect(
      await prisma.reading.findUnique({ where: { id: first.id } }),
    ).toMatchObject({
      pages: 301,
      language: 'fr',
      opinion: 'Corrected first opinion',
    });
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      title: 'Corrected shared title',
      pages: 400,
      language: 'es',
      rating: null,
      opinion: null,
    });
    const other = await fixture();
    await expect(
      updateBook(other.id, { ...editable, title: 'Wrong parent' }, first.id),
    ).rejects.toThrow();
    expect(
      await prisma.book.findUnique({ where: { id: other.id } }),
    ).toMatchObject({ title: input.title });
  });

  it('supports old writers and explicit clearing while updating only the latest reading', async () => {
    const book = await fixture();
    const first = await prisma.reading.findFirstOrThrow({
      where: { bookId: book.id },
    });
    const latest = await recordReread(book.id, crypto.randomUUID(), reread);
    await setBookRating(book.id, 4.5);
    await setBookOpinion(book.id, 'Latest opinion');
    await prisma.book.update({
      where: { id: book.id },
      data: { pages: 410, language: 'de' },
    });
    expect(
      await prisma.reading.findUnique({ where: { id: latest.id } }),
    ).toMatchObject({
      rating: 4.5,
      opinion: 'Latest opinion',
      pages: 410,
      language: 'de',
    });
    await setBookOpinion(book.id, null);
    await setBookRating(book.id, null);
    expect(
      await prisma.reading.findUnique({ where: { id: latest.id } }),
    ).toMatchObject({ rating: null, opinion: null });
    expect(
      await prisma.reading.findUnique({ where: { id: first.id } }),
    ).toEqual(first);
    await expect(
      prisma.book.update({
        where: { id: book.id },
        data: { status: 'to-read', finishedOn: null },
      }),
    ).rejects.toThrow();
  });

  it('rejects missing parents and unread books without creating partial data', async () => {
    await expect(
      recordReread('missing', crypto.randomUUID(), reread),
    ).rejects.toThrow('no longer exists');
    const queue = await fixture({ status: 'to-read', finishedOn: null });
    await expect(
      recordReread(queue.id, crypto.randomUUID(), reread),
    ).rejects.toThrow('first reading');
    expect(await prisma.reading.count({ where: { bookId: queue.id } })).toBe(0);
  });

  it('removes only a confirmed reading, restores the latest projection and protects the final one', async () => {
    const book = await fixture();
    const latest = await recordReread(book.id, crypto.randomUUID(), reread);
    await deleteReading(book.id, latest.id);
    expect(
      await prisma.book.findUnique({ where: { id: book.id } }),
    ).toMatchObject({
      pages: 300,
      language: 'en',
      opinion: input.opinion,
      rating: 3.5,
    });
    const last = await prisma.reading.findFirstOrThrow({
      where: { bookId: book.id },
    });
    await expect(deleteReading(book.id, last.id)).rejects.toThrow(
      'at least one',
    );
    await prisma.book.delete({ where: { id: book.id } });
    expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(0);
  });
});
