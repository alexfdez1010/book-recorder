import { expect, test, type Page } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test.use({ locale: 'es-ES' });

/** Creates one uniquely named book using the public manual-entry flow. */
async function addCollectionBook(page: Page, title: string) {
  await page.getByRole('button', { name: 'Add book', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Add manually/ }).click();
  await dialog.getByLabel('Title', { exact: true }).fill(title);
  const author = dialog.getByRole('combobox', { name: 'Author', exact: true });
  await author.fill('Collection Search Writer');
  await author.press('Tab');
  await dialog.getByLabel('Pages').fill('1000');
  await dialog.getByRole('button', { name: 'Save book', exact: true }).click();
  await expect(dialog).toBeHidden();
}

test('collection search, empty recovery and layout controls preserve book actions', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const title = `Collection discovery ${crypto.randomUUID()}`;
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await addCollectionBook(page, title);

  const search = page.getByRole('searchbox', { name: 'Search library' });
  await search.fill(title);
  const cards = page.locator('li.lib-card');
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading', { name: title })).toBeVisible();
  await expect(cards.getByText(/1,000 pages/)).toBeVisible();
  await expect(page.getByRole('status')).toContainText('1 of');

  const listButton = page.getByRole('button', { name: 'List view' });
  await listButton.focus();
  await page.keyboard.press('Enter');
  await expect(listButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('ul.lib-book-list')).toBeVisible();
  await expect(
    cards.getByRole('button', { name: 'Edit', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Grid view' }).click();
  await expect(page.getByRole('button', { name: 'Grid view' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('ul.lib-book-grid')).toBeVisible();

  await search.fill(`Missing collection ${crypto.randomUUID()}`);
  await expect(cards).toHaveCount(0);
  await expect(page.getByText('No matching books')).toBeVisible();
  await page.getByRole('button', { name: 'Show all books' }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  await page.getByRole('link', { name: 'Authors', exact: true }).click();
  await expect(page).toHaveURL(/\/authors$/);
  await expect(
    page.getByRole('heading', { name: 'Authors', level: 1 }),
  ).toBeVisible();
  await search.fill(title);
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole('heading', { name: title })).toBeVisible();
  await expect(cards.getByText(/1,000 pages/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();

  const card = page.locator('li.lib-card', { hasText: title });
  await card.getByRole('button', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Delete book?' })
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(card).toHaveCount(0);
  expect(
    pageErrors,
    'Search and navigation must not produce hydration or runtime errors',
  ).toEqual([]);
});
