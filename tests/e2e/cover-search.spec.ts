import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test.afterAll(async () => {
  await prisma.$disconnect();
});

for (const viewport of [
  { width: 320, height: 700, status: 'to-read', path: '/to-read' },
  { width: 1440, height: 900, status: 'finished', path: '/books' },
]) {
  test(`finds and saves only a missing cover at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    const original = await prisma.book.create({
      data: {
        title: 'The Great Gatsby',
        author: `Cover search ${crypto.randomUUID()}`,
        pages: 181,
        category: 'Fiction',
        language: 'en',
        status: viewport.status,
        finishedOn:
          viewport.status === 'finished' ? new Date('2026-09-01') : null,
        opinion: 'Keep this opinion unchanged.',
        source: 'manual',
        rating: null,
      },
    });
    try {
      await page.goto('/login');
      await page.getByLabel('Password').fill(PASSWORD);
      await page.getByRole('button', { name: 'Unlock' }).click();
      await expect(page).toHaveURL(/\/books$/);
      await page.goto(viewport.path);
      const card = page
        .locator('li.lib-card')
        .filter({ hasText: original.author });
      await card.getByRole('button', { name: 'Edit' }).click();
      const dialog = page.getByRole('dialog');
      const title = dialog.getByLabel('Title', { exact: true });
      const cover = dialog.getByLabel('Cover URL');
      await expect(cover).toHaveValue('');
      await title.fill(' ');
      await dialog.getByRole('button', { name: 'Find cover by title' }).click();
      await expect(dialog.getByRole('status')).toHaveText(
        'Enter a book title first.',
      );
      await title.fill(original.title);
      await dialog.getByRole('button', { name: 'Find cover by title' }).click();
      const results = dialog.getByRole('list', {
        name: 'Cover search results',
      });
      await expect(results.getByRole('button').first()).toBeVisible({
        timeout: 25_000,
      });
      await results.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          dialog.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        )
        .toBe(true);
      await page.screenshot({
        path: test.info().outputPath(`cover-search-${viewport.width}.png`),
        animations: 'disabled',
      });
      await results.getByRole('button').first().click();
      await expect(cover).toHaveValue(/^https?:\/\//);
      const selectedUrl = await cover.inputValue();
      await expect(title).toHaveValue(original.title);
      await expect(dialog.getByLabel('Pages')).toHaveValue('181');
      await expect(dialog.getByLabel(/^Opinion/)).toHaveValue(
        original.opinion!,
      );
      // Selecting an image must not save the book implicitly.
      expect(
        await prisma.book.findUnique({ where: { id: original.id } }),
      ).toEqual(original);
      await dialog.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(dialog).toBeHidden();
      const saved = await prisma.book.findUniqueOrThrow({
        where: { id: original.id },
      });
      expect(saved).toEqual({
        ...original,
        coverUrl: selectedUrl,
        updatedAt: saved.updatedAt,
      });
      await card.getByRole('button', { name: 'Edit' }).click();
      await expect(dialog.getByLabel('Cover URL')).toHaveValue(selectedUrl);
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    } finally {
      await prisma.book.delete({ where: { id: original.id } });
    }
  });
}
