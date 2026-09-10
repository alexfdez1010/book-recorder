import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

/** Selects an item from an accessible HeroUI combobox. */
async function chooseOption(
  page: import('@playwright/test').Page,
  label: string,
  option: string,
) {
  const control = page
    .getByRole('combobox', { name: label, exact: true })
    .or(page.getByRole('button', { name: new RegExp(label) }));
  await control.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

/** Enters and commits a custom author through the inline HeroUI combobox. */
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

test('add dialog supports keyboard open, dismiss, and focus restore', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: 'Add book' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
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
  const savedTitle = await title.inputValue();

  const pages = page.getByLabel('Pages');
  if ((await pages.inputValue()) === '') await pages.fill('180');
  await chooseOption(page, 'Category', 'Fiction');
  await chooseOption(page, 'Language', 'English');

  await page.getByRole('button', { name: 'Save book' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: savedTitle }).first(),
  ).toBeVisible();
});

test('manually add a book without searching', async ({ page }) => {
  const category = 'E2E Personal Essays';
  await page.getByRole('button', { name: 'Add book' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.getByRole('button', { name: /Add manually/ }).click();
  await expect(page.getByTestId('add-book-form')).toBeVisible();

  await page.getByLabel('Title', { exact: true }).fill('My Private Journal');
  await chooseCustomAuthor(page, 'Someone Unknown');
  await page.getByLabel('Pages').fill('123');
  const categoryInput = page.getByRole('combobox', {
    name: 'Category',
    exact: true,
  });
  await categoryInput.fill(category);
  await page.getByRole('option').filter({ hasText: category }).click();
  await chooseOption(page, 'Language', 'English');

  await page.getByRole('button', { name: 'Save book' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'My Private Journal' }).first(),
  ).toBeVisible();
  const card = page
    .locator('li.lib-card', { hasText: 'My Private Journal' })
    .last();
  await expect(card.getByText(category, { exact: true })).toBeVisible();
});

test('create, edit, and clear an optional book opinion', async ({ page }) => {
  const title = `Opinion lifecycle book ${crypto.randomUUID()}`;
  const matchingCards = page.locator('li', {
    has: page.getByRole('heading', { name: title }),
  });
  const initialOpinion =
    'Una lectura lúcida y muy humana.\nEl desenlace todavía resuena: café, lluvia y corazón.';
  const updatedOpinion =
    'En la relectura encontré más matices — y un final aún más fuerte.';

  await page.getByRole('button', { name: 'Add book' }).click();
  await page.getByRole('button', { name: /Add manually/ }).click();

  await page.getByLabel('Title', { exact: true }).fill(title);
  await chooseCustomAuthor(page, 'Opinion Author');
  await page.getByLabel('Pages').fill('240');
  await chooseOption(page, 'Category', 'Other');
  await page
    .getByRole('textbox', { name: 'Opinion (optional)', exact: true })
    .fill(initialOpinion);
  await page.getByRole('button', { name: 'Save book' }).click();

  const card = matchingCards.last();
  await expect(card).toBeVisible();
  await card.getByText('Opinion', { exact: true }).click();
  await expect(card.getByText(initialOpinion)).toBeVisible();

  await card.getByRole('button', { name: 'Edit' }).click();
  const editDialog = page.getByRole('dialog', { name: 'Edit book' });
  const editOpinion = editDialog.getByRole('textbox', {
    name: 'Opinion (optional)',
    exact: true,
  });
  await expect(editOpinion).toHaveValue(initialOpinion);
  await editOpinion.fill(updatedOpinion);
  await editDialog.getByRole('button', { name: 'Save' }).click();
  await expect(editDialog).toBeHidden();
  await expect(card.getByText(updatedOpinion)).toBeVisible();

  await card.getByRole('button', { name: 'Edit' }).click();
  await editDialog.getByLabel(/^Opinion/).fill('');
  await editDialog.getByRole('button', { name: 'Save' }).click();
  await expect(editDialog).toBeHidden();
  await expect(card.getByText('Opinion', { exact: true })).toHaveCount(0);

  await card.getByRole('button', { name: 'Delete' }).click();
  const deleteDialog = page.getByRole('dialog', { name: 'Delete book?' });
  await deleteDialog.getByRole('button', { name: 'Delete' }).click();
  await expect(deleteDialog).toBeHidden();
  await expect(matchingCards).toHaveCount(0);
});

test('graphs page shows dashboard after a book is added', async ({ page }) => {
  await page.getByRole('link', { name: 'Graphs' }).click();
  await expect(page).toHaveURL(/\/graphs$/);
  await expect(page.getByRole('heading', { name: 'Graphs' })).toBeVisible();
});
