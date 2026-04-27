import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
});

test('queue a to-read book and promote it to finished', async ({ page }) => {
  await page.getByRole('link', { name: 'To read' }).click();
  await expect(page).toHaveURL(/\/to-read$/);

  await page.getByRole('button', { name: 'Add to read' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('button', { name: /Add manually/ }).click();
  await expect(page.getByTestId('add-book-form')).toBeVisible();

  // The Finished-on field is hidden in to-read mode.
  await expect(page.getByLabel('Finished on')).toHaveCount(0);

  const title = `To-Read Book ${Date.now()}`;
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByTestId('author-combobox').click();
  const authorSearch = page.getByPlaceholder('Search authors…');
  await authorSearch.fill('Queue Author');
  await authorSearch.press('Enter');
  await page.getByLabel('Pages').fill('210');
  await page.getByLabel('Category').selectOption('Other');
  await page.getByLabel('Language').selectOption('en');

  await page.getByRole('button', { name: 'Save to read' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // It must NOT appear on the finished shelf yet.
  await page.getByRole('link', { name: 'Books' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);

  // Promote it.
  await page.getByRole('link', { name: 'To read' }).click();
  const card = page.locator('li.lib-card', { hasText: title });
  await card.getByRole('button', { name: /Mark finished/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Mark finished/ })
    .click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);

  // Now visible on /books.
  await page.getByRole('link', { name: 'Books' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});
