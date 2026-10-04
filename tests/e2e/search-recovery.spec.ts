import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page
    .getByLabel('Password')
    .fill(process.env.PASSWORD ?? 'dev-password');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await page.getByRole('button', { name: 'Add book' }).click();
});

test('manual entry can return to a fresh search without closing the dialog', async ({
  page,
}) => {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Add manually' }).click();
  await dialog.getByLabel('Title', { exact: true }).fill('Unsaved title');
  await dialog.getByRole('button', { name: 'Back to search' }).click();
  await expect(dialog.getByLabel('Book title')).toBeFocused();
  await expect(dialog.getByLabel('Book title')).toHaveValue('');
  await expect(
    dialog.getByRole('button', { name: 'Search', exact: true }),
  ).toBeDisabled();
});

test('category focus and explicit browsing do not toggle the menu closed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Add manually' }).click();
  const category = dialog.getByRole('combobox', {
    name: 'Category',
    exact: true,
  });
  await category.focus();
  await expect(category).toHaveAttribute('aria-expanded', 'false');
  await dialog.getByRole('button', { name: 'Show categories' }).click();
  await expect(category).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('option', { name: 'Other', exact: true }).click();
  await expect(category).toHaveValue('Other');
  await expect(category).toHaveAttribute('aria-expanded', 'false');
});

test('a failed replacement search removes stale candidates and offers manual recovery', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Book title').fill('The Great Gatsby');
  await dialog.getByRole('button', { name: 'Search', exact: true }).click();
  const results = dialog.getByTestId('search-results');
  await expect(results.getByRole('button').first()).toBeVisible({
    timeout: 25_000,
  });
  await expect(dialog.getByRole('status')).toHaveText(/\d+ results/);

  // Abort only the action request, at the network boundary.
  await page.route('**/books', async (route) => {
    if (route.request().headers()['next-action']) await route.abort('failed');
    else await route.continue();
  });
  await dialog.getByLabel('Book title').fill('Another title');
  await dialog.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText(
    /Try again or add the book manually/,
  );
  await expect(results.getByRole('button')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Add manually' }).click();
  await expect(dialog.getByLabel('Title', { exact: true })).toBeVisible();
});
