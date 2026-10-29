import { expect, test, type Page } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';

test.use({ locale: 'es-ES' });

const PASSWORD = process.env.PASSWORD ?? 'dev-password';
const DAY = 86_400_000;
const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
let database: PrismaClient;
let week: { books: number; pages: number };
let month: { books: number; pages: number };

/** Returns midnight UTC at a calendar-day offset from the test's reference date. */
function dateAtOffset(now: Date, offset: number): Date {
  return new Date(Math.floor(now.getTime() / DAY) * DAY + offset * DAY);
}

/** Queries the persisted finished-book totals independently of the chart reducer. */
async function persistedTotals(now: Date, days: number) {
  const result = await database.book.aggregate({
    where: {
      status: 'finished',
      finishedOn: {
        gte: dateAtOffset(now, 1 - days),
        lt: dateAtOffset(now, 1),
      },
    },
    _count: true,
    _sum: { pages: true },
  });
  return { books: result._count, pages: result._sum.pages ?? 0 };
}

/** Signs in through the real UI and opens the performance dashboard. */
async function openGraphs(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await page.getByRole('link', { name: 'Graphs', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Graphs', level: 1 }),
  ).toBeVisible();
}

test.beforeAll(async () => {
  const url = new URL(
    process.env.DATABASE_URL ?? 'postgresql://invalid/invalid',
  );
  if (
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    !url.pathname.includes('_test')
  ) {
    throw new Error(
      'Recent performance fixtures require a local disposable *_test database.',
    );
  }
  database = new PrismaClient();
  const now = new Date();
  await database.book.createMany({
    data: [
      {
        id: ids[0],
        title: 'Recent performance week fixture',
        author: 'Performance fixture',
        pages: 1207,
        category: 'Other',
        language: 'en',
        status: 'finished',
        finishedOn: dateAtOffset(now, -2),
      },
      {
        id: ids[1],
        title: 'Recent performance month fixture',
        author: 'Performance fixture',
        pages: 3019,
        category: 'Other',
        language: 'en',
        status: 'finished',
        finishedOn: dateAtOffset(now, -20),
      },
      {
        id: ids[2],
        title: 'Recent performance queue fixture',
        author: 'Performance fixture',
        pages: 80000,
        category: 'Other',
        language: 'en',
        status: 'to-read',
        finishedOn: null,
      },
    ],
  });
  week = await persistedTotals(now, 7);
  month = await persistedTotals(now, 30);
});

test.afterAll(async () => {
  if (!database) return;
  await database.book.deleteMany({ where: { id: { in: ids } } });
  await database.$disconnect();
});

test('recent performance switches periods by keyboard and exposes exact daily data', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openGraphs(page);
  const weekTab = page.getByRole('tab', { name: 'Last 7 days', exact: true });
  const monthTab = page.getByRole('tab', { name: 'Last 30 days', exact: true });
  let panel = page.getByRole('tabpanel', { name: 'Last 7 days', exact: true });
  await expect(weekTab).toHaveAttribute('aria-selected', 'true');
  await expect(panel.getByTestId('recent-books')).toHaveText(
    week.books.toLocaleString('en-US'),
  );
  await expect(panel.getByTestId('recent-pages')).toHaveText(
    week.pages.toLocaleString('en-US'),
  );
  await expect(
    panel.getByText(/Pages are counted on the date a book is finished/),
  ).toBeVisible();
  await panel.getByText('View daily figures', { exact: true }).click();
  await expect(panel.getByRole('table').locator('tbody tr')).toHaveCount(7);

  await weekTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(monthTab).toBeFocused();
  await expect(monthTab).toHaveAttribute('aria-selected', 'true');
  panel = page.getByRole('tabpanel', { name: 'Last 30 days', exact: true });
  await expect(panel.getByTestId('recent-books')).toHaveText(
    month.books.toLocaleString('en-US'),
  );
  await expect(panel.getByTestId('recent-pages')).toHaveText(
    month.pages.toLocaleString('en-US'),
  );
  await panel.getByText('View daily figures', { exact: true }).click();
  await expect(panel.getByRole('table').locator('tbody tr')).toHaveCount(30);
  expect(errors).toEqual([]);
});

test('recent charts fit a narrow screen and honor reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGraphs(page);
  await page.getByRole('tab', { name: 'Last 30 days', exact: true }).click();
  const panel = page.getByRole('tabpanel', {
    name: 'Last 30 days',
    exact: true,
  });
  await expect(
    panel.getByRole('figure', { name: 'Daily completed pages chart' }),
  ).toBeVisible();
  await expect(
    panel.getByRole('figure', { name: 'Cumulative pace comparison chart' }),
  ).toBeVisible();
  await expect(panel.getByTestId('recent-pages')).toHaveText(
    month.pages.toLocaleString('en-US'),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await panel.getByText('View daily figures', { exact: true }).click();
  await expect(panel.getByRole('table').locator('tbody tr')).toHaveCount(30);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
