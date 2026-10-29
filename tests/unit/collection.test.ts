import { describe, expect, it } from 'vitest';
import { filterCollection, groupCollection } from '@/lib/books/collection';

const books = [
  {
    id: 'a',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    category: 'Fiction',
    finishedOn: new Date('2026-02-01T00:30:00Z'),
  },
  {
    id: 'b',
    title: 'The Dispossessed',
    author: 'Ursula K. Le Guin',
    category: 'Science Fiction',
    finishedOn: new Date('2026-01-31T23:59:59Z'),
  },
  {
    id: 'c',
    title: 'A Wizard of Earthsea',
    author: 'Ursula K. Le Guin',
    category: 'Fantasy',
    finishedOn: new Date('2025-12-31T23:00:00Z'),
  },
];

describe('filterCollection', () => {
  it('matches case and accent-insensitive text across all searchable fields', () => {
    expect(filterCollection(books, 'GARCIA')).toEqual([books[0]]);
    expect(filterCollection(books, 'CIEN GARCIA fiction')).toEqual([books[0]]);
    expect(filterCollection(books, 'science')).toEqual([books[1]]);
  });

  it('requires every query word while preserving source order', () => {
    expect(filterCollection(books, '  le   guin ')).toEqual([
      books[1],
      books[2],
    ]);
    expect(filterCollection(books, 'earthsea science')).toEqual([]);
    expect(filterCollection(books, 'missing')).toEqual([]);
  });

  it('returns all books for a blank query and does not mutate the source', () => {
    const source = [...books];
    const result = filterCollection(source, ' \t\n');
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
    expect(source).toEqual(books);
    expect(filterCollection([], 'book')).toEqual([]);
  });

  it('normalizes decomposed Unicode accents', () => {
    expect(filterCollection(books, 'Garci\u0301a')).toEqual([books[0]]);
  });
});

describe('groupCollection', () => {
  it('groups by UTC month across year and offset boundaries', () => {
    const offset = {
      ...books[0],
      id: 'offset',
      finishedOn: new Date('2026-02-01T00:30:00+02:00'),
    };
    const groups = groupCollection([...books, offset], 'month');
    expect(groups.map((group) => [group.key, group.label])).toEqual([
      ['2026-02', 'February 2026'],
      ['2026-01', 'January 2026'],
      ['2025-12', 'December 2025'],
    ]);
    expect(groups[1].books.map((book) => book.id)).toEqual(['b', 'offset']);
  });

  it('ranks authors by book count, breaks ties alphabetically and sorts books newest first', () => {
    const tie = { ...books[0], id: 'tie', author: 'Alice' };
    const groups = groupCollection(
      [books[2], books[0], books[1], tie],
      'author',
    );
    expect(groups.map((group) => group.label)).toEqual([
      'Ursula K. Le Guin',
      'Alice',
      'Gabriel García Márquez',
    ]);
    expect(groups[0].books.map((book) => book.id)).toEqual(['b', 'c']);
  });

  it('keeps queue order and handles absent completion dates', () => {
    const queued = books.map((book) => ({ ...book, finishedOn: null }));
    const groups = groupCollection(queued, 'none');
    expect(groups).toEqual([{ key: 'all', label: null, books: queued }]);
    expect(groups[0].books).not.toBe(queued);
    expect(groupCollection(queued, 'month')[0].label).toBe('Undated');
  });

  it('returns no groups for empty input and leaves the source untouched', () => {
    expect(groupCollection([], 'month')).toEqual([]);
    expect(groupCollection([], 'author')).toEqual([]);
    expect(groupCollection([], 'none')).toEqual([]);
    const source = [...books].reverse();
    const before = [...source];
    groupCollection(source, 'month');
    groupCollection(source, 'author');
    expect(source).toEqual(before);
  });
});
