import { test, expect } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  await page.goto('/skill');
  await expect(page).toHaveURL(/\/skill$/);
});

test('copies MCP JSON and downloads both integration files', async ({
  context,
  page,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.getByRole('button', { name: 'Copy JSON' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('book-recorder');

  const skillDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download SKILL.md' }).click();
  await expect((await skillDownload).suggestedFilename()).toBe('SKILL.md');

  const configDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download config' }).click();
  await expect((await configDownload).suggestedFilename()).toBe(
    'book-recorder.mcp.json',
  );
});
