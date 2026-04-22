import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test('redirects unauthenticated user to /login', async ({ page }) => {
  const response = await page.goto('/books');
  await expect(page).toHaveURL(/\/login/);
  expect(response?.status()).toBeLessThan(500);
});

test('rejects wrong password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.getByText(/invalid password/i)).toBeVisible();
});

test('accepts correct password and lands on /books', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole('heading', { name: 'Books' })).toBeVisible();
});
