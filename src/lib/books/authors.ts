export interface AuthorBook {
  author: string;
  finishedOn: Date;
}

export interface AuthorGroup<T extends AuthorBook> {
  author: string;
  books: T[];
}

/**
 * Group books by author. Authors sorted by book count descending, ties broken
 * alphabetically (locale-aware). Books within each group sorted by finishedOn
 * descending.
 */
export function groupByAuthor<T extends AuthorBook>(books: T[]): AuthorGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const b of books) {
    const list = map.get(b.author);
    if (list) list.push(b);
    else map.set(b.author, [b]);
  }
  const groups: AuthorGroup<T>[] = [...map.entries()].map(([author, list]) => ({
    author,
    books: list
      .slice()
      .sort((a, b) => b.finishedOn.getTime() - a.finishedOn.getTime()),
  }));
  groups.sort((a, b) => {
    if (b.books.length !== a.books.length) return b.books.length - a.books.length;
    return a.author.localeCompare(b.author);
  });
  return groups;
}
