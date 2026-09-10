import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

/** Selects a category from the accessible HeroUI combobox. */
async function chooseOption(
  page: import('@playwright/test').Page,
  label: string,
  option: string,
) {
  await page
    .getByRole('combobox', { name: label, exact: true })
    .or(page.getByRole('button', { name: new RegExp(label) }))
    .click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

/** Enters and commits a custom author in the inline author combobox. */
async function chooseCustomAuthor(
  page: import('@playwright/test').Page,
  author: string,
) {
  const control = page.getByRole('combobox', {
    name: 'Author',
    exact: true,
  });
  await control.fill(author);
  await control.press('Tab');
  await expect(control).toHaveValue(author);
}

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
  await chooseCustomAuthor(page, 'Queue Author');
  await page.getByLabel('Pages').fill('210');
  await chooseOption(page, 'Category', 'Other');
  await chooseOption(page, 'Language', 'English');

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
