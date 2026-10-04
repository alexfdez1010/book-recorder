import { expect, test, type Page } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

/** Creates an isolated manual book; returns its card for rating interactions. */
async function createBook(page: Page) {
  const title = `Rating keyboard book ${crypto.randomUUID()}`;
  await page.getByRole('button', { name: 'Add book' }).click();
  await page.getByRole('button', { name: /Add manually/ }).click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  const author = page.getByRole('combobox', { name: 'Author', exact: true });
  await author.fill('Rating Author');
  await author.press('Tab');
  await page.getByLabel('Pages').fill('120');
  const categoryTrigger = page.getByRole('button', { name: 'Show categories' });
  await categoryTrigger.scrollIntoViewIfNeeded();
  await categoryTrigger.click();
  await page.getByRole('option', { name: 'Other', exact: true }).click();

  const group = page.getByRole('radiogroup', { name: 'Rating', exact: true });
  const first = group.getByRole('radio', { name: '0.5 stars', exact: true });
  await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  await first.focus();
  await first.press('ArrowLeft');
  await expect(
    group.getByRole('radio', { name: '5 stars', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await expect(
    group.getByRole('radio', { name: '4.5 stars', exact: true }),
  ).toBeChecked();

  await page.getByRole('button', { name: 'Save book' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  const card = page.locator('li.lib-card', {
    has: page.getByRole('heading', { name: title, exact: true }),
  });
  await expect(card).toBeVisible();
  return card;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
});

test('half-star keyboard selection persists and selected values can be cleared', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const card = await createBook(page);
  const group = card.getByRole('radiogroup', { name: 'Book rating' });
  const targets = await group.getByRole('radio').evaluateAll((radios) =>
    radios.map((radio) => {
      const { width, height, left, right } = radio.getBoundingClientRect();
      return { width, height, left, right };
    }),
  );
  for (const target of targets) {
    expect(target.width).toBeGreaterThanOrEqual(24);
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(target.left).toBeGreaterThanOrEqual(0);
    expect(target.right).toBeLessThanOrEqual(320);
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  const selected = group.getByRole('radio', { name: '4.5 stars', exact: true });
  const last = group.getByRole('radio', { name: '5 stars', exact: true });
  await expect(selected).toBeChecked();
  await selected.focus();
  await selected.press('ArrowRight');
  await expect(last).toBeChecked();
  await expect(last).toBeEnabled();
  await expect(last).toBeFocused();
  await page.reload();
  await expect(last).toBeChecked();
  await last.focus();
  await last.press('Space');
  await expect(group.locator('[aria-checked="true"]')).toHaveCount(0);
  await expect(last).toBeEnabled();
  await page.reload();
  await expect(group.locator('[aria-checked="true"]')).toHaveCount(0);
  await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  await group.getByRole('radio', { name: '0.5 stars', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(
    card.getByRole('button', { name: 'Edit', exact: true }),
  ).toBeFocused();
});

test('a failed rating save blocks repeated requests, rolls back and allows retry', async ({
  page,
}) => {
  const card = await createBook(page);
  const group = card.getByRole('radiogroup', { name: 'Book rating' });
  const selected = group.getByRole('radio', { name: '4.5 stars', exact: true });
  const next = group.getByRole('radio', { name: '3 stars', exact: true });
  let requests = 0;
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/books', async (route) => {
    if (
      route.request().method() !== 'POST' ||
      !route.request().headers()['next-action']
    ) {
      await route.continue();
      return;
    }
    requests += 1;
    await blocked;
    await route.abort('failed');
  });
  try {
    await next.click();
    await expect(next).toBeDisabled();
    await expect(next).toBeChecked();
    await expect.poll(() => requests).toBe(1);
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('ArrowDown');
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    await page.keyboard.press('ArrowRight');
    await next.click({ force: true });
    expect(requests).toBe(1);
    await expect(next).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      card.getByRole('button', { name: 'Edit', exact: true }),
    ).toBeFocused();
  } finally {
    release();
  }
  await expect(card.getByRole('alert')).toHaveText(
    'Rating could not be saved. Please try again.',
  );
  await expect(selected).toBeChecked();
  await expect(next).toBeEnabled();
  await page.unroute('**/books');
  await next.click();
  await expect(next).toBeChecked();
  await expect(next).toBeEnabled();
  await expect(card.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(next).toBeChecked();
});
