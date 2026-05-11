/**
 * Canonical seed list of book categories. Mirrored by the seed migration so
 * adapters always have a known target for `normalizeCategory`. The runtime
 * list of available categories is loaded from the database (see
 * `categoriesRepository`) so users can add custom ones.
 */
export const SEED_BOOK_CATEGORIES = [
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

export type SeedBookCategory = (typeof SEED_BOOK_CATEGORIES)[number];

const RULES: Array<[RegExp, SeedBookCategory]> = [
  [/science[- ]?fiction|sci-?fi|space opera|dystop/i, 'Science Fiction'],
  [/fantasy|mythology|fairy tale/i, 'Fantasy'],
  [/mystery|thriller|crime|detective|suspense|noir/i, 'Mystery & Thriller'],
  [/romance/i, 'Romance'],
  [/horror|supernatural/i, 'Horror'],
  [/biograph|memoir|autobiograph/i, 'Biography & Memoir'],
  [/histor/i, 'History'],
  [/philosoph|ethic|metaphysic/i, 'Philosophy'],
  [/self[- ]?help|personal development|productivity/i, 'Self-Help'],
  [
    /business|economic|finance|management|marketing|entrepreneur|leadership/i,
    'Business',
  ],
  [/poetry|poem|verse/i, 'Poetry'],
  [/computer|programming|software|technology|engineering/i, 'Technology'],
  [/science|physics|math|biology|chemistry|astronomy|nature/i, 'Science'],
  [/fiction|novel|literature|literary|short stor/i, 'Fiction'],
];

/**
 * Map an arbitrary category string (Open Library subject or Google Books
 * category) to one of our seed categories. Returns 'Other' when nothing
 * matches. Used only by search adapters to pre-fill the form; users can
 * still pick or create any category at save time.
 */
export function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return 'Other';
  for (const [re, cat] of RULES) {
    if (re.test(raw)) return cat;
  }
  return 'Other';
}
