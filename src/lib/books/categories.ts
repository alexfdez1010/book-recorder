/**
 * Fixed enumeration of book categories. Keep between 10 and 15 to stay
 * useful on the Categories pie chart without fragmenting into long-tail noise.
 */
export const BOOK_CATEGORIES = [
  'Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery & Thriller',
  'Romance',
  'Horror',
  'Biography & Memoir',
  'History',
  'Science',
  'Technology',
  'Philosophy',
  'Self-Help',
  'Business',
  'Poetry',
  'Other',
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

const RULES: Array<[RegExp, BookCategory]> = [
  [/science[- ]?fiction|sci-?fi|space opera|dystop/i, 'Science Fiction'],
  [/fantasy|mythology|fairy tale/i, 'Fantasy'],
  [/mystery|thriller|crime|detective|suspense|noir/i, 'Mystery & Thriller'],
  [/romance/i, 'Romance'],
  [/horror|supernatural/i, 'Horror'],
  [/biograph|memoir|autobiograph/i, 'Biography & Memoir'],
  [/histor/i, 'History'],
  [/philosoph|ethic|metaphysic/i, 'Philosophy'],
  [/self[- ]?help|personal development|productivity/i, 'Self-Help'],
  [/business|economic|finance|management|marketing|entrepreneur|leadership/i, 'Business'],
  [/poetry|poem|verse/i, 'Poetry'],
  [/computer|programming|software|technology|engineering/i, 'Technology'],
  [/science|physics|math|biology|chemistry|astronomy|nature/i, 'Science'],
  [/fiction|novel|literature|literary|short stor/i, 'Fiction'],
];

/**
 * Map an arbitrary category string (Open Library subject or Google Books
 * category) to one of our enum values. Returns 'Other' when nothing matches.
 */
export function normalizeCategory(raw: string | null | undefined): BookCategory {
  if (!raw) return 'Other';
  for (const [re, cat] of RULES) {
    if (re.test(raw)) return cat;
  }
  return 'Other';
}
