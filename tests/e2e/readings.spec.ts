import { test, expect, type Page } from '../helpers/fixtures';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const PASSWORD = process.env.PASSWORD ?? 'dev-password';
test.use({ locale: 'es-ES', timezoneId: 'Europe/Madrid' });
test.afterAll(async () => {
  await prisma.$disconnect();
});

/** Signs into the disposable local application through the real owner flow. */
async function signIn(page: Page) {
  await page.goto('/login');
  await page
    .getByLabel('Email')
    .fill(process.env.AUTH_OWNER_EMAIL ?? 'owner@example.test');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
}

/** Asserts that page and dialog content remain contained on narrow screens. */
async function expectContained(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const dialog = page.getByRole('dialog');
  if (await dialog.count()) {
    const bounds = await dialog.boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
  }
}

for (const width of [320, 390, 1440]) {
  test(`records, edits and removes a reread without losing history at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const book = await prisma.book.create({
      data: {
        title: `A long title about returning to familiar stories and finding something new ${crypto.randomUUID()}`,
        author: 'Rereading fixture',
        pages: 300,
        category: 'Fiction',
        language: 'en',
        finishedOn: new Date('2020-01-10'),
        rating: 3.5,
        opinion: 'First encounter\nCafé, lluvia y corazón',
      },
    });
    try {
      const first = await prisma.reading.findFirstOrThrow({
        where: { bookId: book.id },
      });
      await signIn(page);
      await page
        .getByRole('searchbox', { name: 'Search library' })
        .fill(book.title);
      const cards = page.locator('li.lib-card').filter({ hasText: book.title });
      await expect(cards).toHaveCount(1);
      const trigger = cards.getByRole('button', {
        name: 'Register reread',
        exact: true,
      });
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(
        page.getByRole('dialog', { name: 'Register reread' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await page.clock.setFixedTime(new Date('2026-11-09T23:30:00Z'));
      await trigger.click();
      let dialog = page.getByRole('dialog', { name: 'Register reread' });
      await expect(dialog.getByLabel('Finished on')).toHaveValue('2026-11-10');
      await expect(
        dialog.getByLabel('Opinion (optional)', { exact: true }),
      ).toHaveValue('');
      await expect(dialog.getByRole('radio', { checked: true })).toHaveCount(0);
      await dialog.getByLabel('Finished on').fill('2026-11-09');
      await dialog
        .getByRole('radio', { name: '4.5 stars', exact: true })
        .click();
      await dialog
        .getByLabel('Opinion (optional)', { exact: true })
        .fill('A different view\nMás matices en la relectura');
      await dialog.getByText('Edition and language', { exact: true }).click();
      await dialog.getByLabel('Pages', { exact: true }).fill('310');
      await dialog.getByRole('button', { name: 'Language' }).click();
      await page.getByRole('option', { name: 'Spanish', exact: true }).click();
      await expectContained(page);
      await dialog
        .getByRole('button', { name: 'Save reread', exact: true })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`reread-form-${width}.png`),
        animations: 'disabled',
      });
      await dialog
        .getByRole('button', { name: 'Save reread', exact: true })
        .click();
      await expect(dialog).toBeHidden();
      await expect(cards).toHaveCount(2);
      await expect(
        cards.first().getByText('Reread', { exact: true }),
      ).toBeVisible();
      await expect(cards.first().getByText(/310 pages/)).toBeVisible();
      expect(
        await prisma.reading.findUnique({ where: { id: first.id } }),
      ).toEqual(first);
      const latest = await prisma.reading.findFirstOrThrow({
        where: { bookId: book.id },
        orderBy: { finishedOn: 'desc' },
      });
      expect(latest).toMatchObject({ pages: 310, language: 'es', rating: 4.5 });
      expect(latest.opinion?.replaceAll('\r\n', '\n')).toBe(
        'A different view\nMás matices en la relectura',
      );
      await expectContained(page);
      await page.screenshot({
        path: testInfo.outputPath(`reread-journal-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      });

      await cards
        .first()
        .getByRole('button', { name: '2 readings', exact: true })
        .click();
      dialog = page.getByRole('dialog', { name: 'Reading history' });
      await expect(
        dialog.getByRole('heading', { name: 'First reading', exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('heading', { name: 'Reading 2', exact: true }),
      ).toBeVisible();
      await expectContained(page);
      await page.screenshot({
        path: testInfo.outputPath(`reading-history-${width}.png`),
        animations: 'disabled',
      });
      const firstItem = dialog.locator('li').filter({
        has: page.getByRole('heading', {
          name: 'First reading',
          exact: true,
        }),
      });
      await firstItem
        .getByRole('button', { name: 'Edit reading', exact: true })
        .click();
      dialog = page.getByRole('dialog', { name: 'Edit reading' });
      await expect(
        dialog.getByRole('heading', { name: 'Edit reading', exact: true }),
      ).toBeFocused();
      await expect(
        dialog.getByLabel('Opinion (optional)', { exact: true }),
      ).toHaveValue(first.opinion!);
      await dialog
        .getByLabel('Opinion (optional)', { exact: true })
        .fill('A corrected first impression');
      await dialog
        .getByRole('button', { name: 'Save reading', exact: true })
        .click();
      dialog = page.getByRole('dialog', { name: 'Reading history' });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('heading', { name: 'Reading history', exact: true }),
      ).toBeFocused();
      expect(
        await prisma.reading.findUnique({ where: { id: latest.id } }),
      ).toEqual(latest);
      expect(
        await prisma.reading.findUnique({ where: { id: first.id } }),
      ).toMatchObject({ opinion: 'A corrected first impression' });
      const latestItem = dialog.locator('li').filter({
        has: page.getByRole('heading', { name: 'Reading 2', exact: true }),
      });
      await latestItem
        .getByRole('button', { name: 'Remove reading', exact: true })
        .click();
      await latestItem
        .getByRole('group', { name: 'Confirm reading removal' })
        .getByRole('button', { name: 'Keep reading', exact: true })
        .click();
      expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(
        2,
      );
      await latestItem
        .getByRole('button', { name: 'Remove reading', exact: true })
        .click();
      await latestItem
        .getByRole('group', { name: 'Confirm reading removal' })
        .getByRole('button', { name: 'Remove reading', exact: true })
        .click();
      await expect(
        dialog.getByRole('heading', { name: 'Reading 2', exact: true }),
      ).toHaveCount(0);
      await expect(
        dialog.getByRole('button', { name: 'Remove reading', exact: true }),
      ).toHaveCount(0);
      await dialog.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(cards).toHaveCount(1);
      await expect(
        cards.getByRole('button', { name: '1 reading', exact: true }),
      ).toBeFocused();
      expect(
        await prisma.book.findUnique({ where: { id: book.id } }),
      ).toMatchObject({
        pages: 300,
        language: 'en',
        rating: 3.5,
        opinion: 'A corrected first impression',
      });
      await page.getByRole('link', { name: 'Authors', exact: true }).click();
      await page
        .getByRole('searchbox', { name: 'Search library' })
        .fill(book.title);
      await expect(
        page.locator('li.lib-card').filter({ hasText: book.title }),
      ).toHaveCount(1);
      await expectContained(page);
      expect(errors).toEqual([]);
    } finally {
      await prisma.book.delete({ where: { id: book.id } });
    }
  });
}

test('failed reread saves retain values, rating and retry identity', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const book = await prisma.book.create({
    data: {
      title: `Retry reread ${crypto.randomUUID()}`,
      author: 'Retry fixture',
      pages: 200,
      category: 'Other',
      language: 'en',
      finishedOn: new Date('2020-01-01'),
    },
  });
  try {
    await signIn(page);
    const card = page.locator('li.lib-card').filter({ hasText: book.title });
    await card.getByRole('button', { name: 'Register reread' }).click();
    const dialog = page.getByRole('dialog', { name: 'Register reread' });
    await dialog
      .getByLabel('Opinion (optional)', { exact: true })
      .fill('Keep my unsaved opinion');
    await dialog.getByRole('radio', { name: '5 stars', exact: true }).click();
    await page.route('**/books', (route) =>
      route.request().method() === 'POST'
        ? route.abort('failed')
        : route.continue(),
    );
    await dialog.getByRole('button', { name: 'Save reread' }).click();
    await expect(dialog.getByRole('alert')).toContainText(
      'Your changes are still here',
    );
    await expect(
      dialog.getByLabel('Opinion (optional)', { exact: true }),
    ).toHaveValue('Keep my unsaved opinion');
    await expect(
      dialog.getByRole('radio', { name: '5 stars', exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
    await page.unroute('**/books');
    await dialog.getByRole('button', { name: 'Save reread' }).click();
    await expect(dialog).toBeHidden();
    expect(await prisma.reading.count({ where: { bookId: book.id } })).toBe(2);
  } finally {
    await prisma.book.delete({ where: { id: book.id } });
  }
});
