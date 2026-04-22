import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
});

test('search, select, and add a book end-to-end', async ({ page }) => {
  await page.getByRole('button', { name: 'Add book' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByLabel('Book title').fill('The Great Gatsby');
  await page.getByRole('button', { name: 'Search' }).click();

  const results = page.getByTestId('search-results').locator('li');
  await expect(results.first()).toBeVisible({ timeout: 15000 });

  await results.first().locator('button').click();
  await expect(page.getByTestId('add-book-form')).toBeVisible();

  const title = page.getByLabel('Title', { exact: true });
  await expect(title).not.toHaveValue('');

  const pages = page.getByLabel('Pages');
  if ((await pages.inputValue()) === '') await pages.fill('180');
  const category = page.getByLabel('Category');
  if ((await category.inputValue()) === '') await category.fill('Fiction');
  const language = page.getByLabel('Language');
  if ((await language.inputValue()) === '') await language.fill('en');

  await page.getByRole('button', { name: 'Save book' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
});

test('graphs page shows dashboard after a book is added', async ({ page }) => {
  await page.getByRole('link', { name: 'Graphs' }).click();
  await expect(page).toHaveURL(/\/graphs$/);
  await expect(page.getByRole('heading', { name: 'Graphs' })).toBeVisible();
});
