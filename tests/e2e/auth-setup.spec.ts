import { test, expect } from '../helpers/fixtures';
import { PrismaClient } from '../../generated/prisma';
import { verifyPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();
test.afterAll(async () => prisma.$disconnect());

test('creates the sole account through the private setup link and closes registration', async ({
  page,
}) => {
  // The global setup already refuses all non-local/non-test databases.
  await prisma.user.deleteMany();
  const email = process.env.AUTH_OWNER_EMAIL ?? 'owner@example.test';
  const password = process.env.PASSWORD ?? 'dev-password';
  const body = { email, password, name: 'Alejandro' };
  const denied = await page.request.post('/api/auth/sign-up/email', {
    data: body,
  });
  expect(denied.status()).toBe(403);
  const wrongEmail = await page.request.post('/api/auth/sign-up/email', {
    data: { ...body, email: 'intruder@example.test' },
    headers: { 'x-book-recorder-setup-token': process.env.AUTH_SETUP_TOKEN! },
  });
  expect(wrongEmail.status()).toBe(403);
  await page.goto(`/setup#token=${process.env.AUTH_SETUP_TOKEN}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  for (const [label, width, height] of [
    ['mobile', 390, 844],
    ['desktop', 1440, 900],
  ] as const) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.impeccable/review/auth-setup-${label}.png`,
      fullPage: true,
    });
  }
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/books$/);
  const account = await prisma.account.findFirstOrThrow();
  expect(account.password).not.toBe(password);
  expect(await verifyPassword({ hash: account.password!, password })).toBe(
    true,
  );
  const duplicate = await page.request.post('/api/auth/sign-up/email', {
    data: body,
    headers: {
      'x-book-recorder-setup-token': process.env.AUTH_SETUP_TOKEN!,
      Origin: process.env.BETTER_AUTH_URL!,
    },
  });
  expect(duplicate.status()).toBe(403);
  await expect(
    prisma.user.create({
      data: {
        id: 'second-owner',
        name: 'Second',
        email: 'second@example.test',
      },
    }),
  ).rejects.toMatchObject({ code: 'P2002' });
  expect(await prisma.user.count()).toBe(1);
  await page.goto('/setup');
  await expect(
    page.getByRole('heading', { name: 'Account already created' }),
  ).toBeVisible();
});
