import { expect, test } from '../helpers/fixtures';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const ids: string[] = [];
const PASSWORD = process.env.PASSWORD ?? 'dev-password';
test.use({ locale: 'es-ES' });

test.beforeAll(async () => {
  const title = `Annual rereading fixture ${crypto.randomUUID()}`;
  const base = {
    title,
    author: 'Annual rereading fixture',
    pages: 250,
    category: 'Fiction',
    language: 'en',
  };
  const first = await prisma.book.create({
    data: { ...base, finishedOn: new Date('2019-01-01') },
  });
  ids.push(first.id);
  const duplicateTitle = await prisma.book.create({
    data: { ...base, finishedOn: new Date('2026-01-01') },
  });
  ids.push(duplicateTitle.id);
  await prisma.reading.createMany({
    data: [
      {
        bookId: first.id,
        pages: 260,
        language: 'es',
        finishedOn: new Date('2026-02-01'),
      },
      {
        bookId: first.id,
        pages: 250,
        language: 'en',
        finishedOn: new Date('2026-11-09'),
      },
    ],
  });
});

test.afterAll(async () => {
  await prisma.book.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

/** Calculates independent expected annual totals from persisted chronological records. */
async function annualTotals() {
  const readings = await prisma.reading.findMany({
    orderBy: [{ finishedOn: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  });
  const seen = new Set<string>();
  const totals = new Map<string, { first: number; rereads: number }>();
  for (const reading of readings) {
    const year = reading.finishedOn.getUTCFullYear().toString();
    const row = totals.get(year) ?? { first: 0, rereads: 0 };
    if (seen.has(reading.bookId)) row.rereads++;
    else row.first++;
    seen.add(reading.bookId);
    totals.set(year, row);
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
}

for (const width of [320, 390, 1440]) {
  test(`annual rereading chart exposes exact counts and fits at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/login');
    await page
      .getByLabel('Email')
      .fill(process.env.AUTH_OWNER_EMAIL ?? 'owner@example.test');
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Unlock' }).click();
    await expect(page).toHaveURL(/\/books$/);
    await page.getByRole('link', { name: 'Graphs', exact: true }).click();
    const panel = page.locator('.lib-panel').filter({
      has: page.getByRole('heading', {
        name: 'First readings and rereads',
        exact: true,
      }),
    });
    const figure = panel.getByRole('figure', {
      name: 'First readings and rereads by year',
    });
    await expect(figure).toBeVisible();
    await expect(figure.locator('.recharts-bar-rectangle')).not.toHaveCount(0);
    const totals = await annualTotals();
    const totalRereads = totals.reduce((sum, [, row]) => sum + row.rereads, 0);
    await expect(
      figure.getByText(new RegExp(`^${totalRereads} rereads`)),
    ).toBeVisible();
    const disclosure = panel.getByText('View yearly figures', { exact: true });
    await disclosure.focus();
    await page.keyboard.press('Enter');
    const table = panel.getByRole('table', {
      name: 'Annual first readings and rereads',
    });
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(totals.length);
    for (const [year, row] of totals) {
      await expect(
        table
          .locator('tbody tr')
          .filter({
            has: page.getByRole('rowheader', { name: year, exact: true }),
          })
          .locator('th,td'),
      ).toHaveText([
        year,
        row.first.toLocaleString('en-US'),
        row.rereads.toLocaleString('en-US'),
      ]);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await panel.screenshot({
      path: testInfo.outputPath(`annual-rereads-${width}.png`),
      animations: 'disabled',
    });
    await disclosure.focus();
    await page.keyboard.press('Enter');
    await expect(table).toBeHidden();
    expect(errors).toEqual([]);
  });
}
