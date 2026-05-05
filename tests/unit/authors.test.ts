import { describe, expect, it } from 'vitest';
import { groupByAuthor } from '@/lib/books/authors';

type B = { author: string; finishedOn: Date; id: string };

function book(id: string, author: string, iso: string): B {
  return { id, author, finishedOn: new Date(iso) };
}

describe('groupByAuthor', () => {
  it('returns [] for empty input', () => {
    expect(groupByAuthor([])).toEqual([]);
  });

  it('groups by author and sorts by book count descending', () => {
    const books: B[] = [
      book('a', 'Borges', '2026-01-01'),
      book('b', 'Tolkien', '2026-02-01'),
      book('c', 'Borges', '2026-03-01'),
      book('d', 'Tolkien', '2026-02-15'),
      book('e', 'Tolkien', '2026-04-01'),
    ];
    const groups = groupByAuthor(books);
    expect(groups.map((g) => [g.author, g.books.length])).toEqual([
      ['Tolkien', 3],
      ['Borges', 2],
    ]);
  });

  it('breaks count ties alphabetically', () => {
    const books: B[] = [
      book('a', 'Calvino', '2026-01-01'),
      book('b', 'Borges', '2026-01-01'),
      book('c', 'Asimov', '2026-01-01'),
    ];
    const groups = groupByAuthor(books);
    expect(groups.map((g) => g.author)).toEqual([
      'Asimov',
      'Borges',
      'Calvino',
    ]);
  });

  it('sorts books inside a group by finishedOn descending', () => {
    const books: B[] = [
      book('a', 'Borges', '2026-01-01'),
      book('b', 'Borges', '2026-03-01'),
      book('c', 'Borges', '2026-02-01'),
    ];
    const [group] = groupByAuthor(books);
    expect(group.books.map((b) => b.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const books: B[] = [
      book('a', 'Borges', '2026-01-01'),
      book('b', 'Borges', '2026-03-01'),
    ];
    const snapshot = books.map((b) => b.id);
    groupByAuthor(books);
    expect(books.map((b) => b.id)).toEqual(snapshot);
  });
});
