import { test, expect, type Page } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';
const VIEWPORTS = [
  { name: 'narrow', width: 320, height: 700, capture: false },
  { name: 'mobile', width: 390, height: 844, capture: true },
  { name: 'desktop', width: 1440, height: 900, capture: true },
] as const;
const SCREENS = [
  { path: '/books', heading: 'Books' },
  { path: '/to-read', heading: 'To read' },
  { path: '/authors', heading: 'Authors' },
  { path: '/graphs', heading: 'Graphs' },
  { path: '/skill', heading: 'Skill' },
] as const;

/** Waits for layout to settle, then verifies the document fits horizontally. */
async function expectNoPageOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

/** Verifies that dialog content is not clipped horizontally. */
async function expectNoDialogOverflow(page: Page) {
  const dialog = page.getByRole('dialog');
  await expect
    .poll(() =>
      dialog.evaluate((element) => element.scrollWidth <= element.clientWidth),
    )
    .toBe(true);
}

/** Authenticates through the same login flow used by a reader. */
async function unlock(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
}

/** Completes the manual form in the currently open add-book dialog. */
async function completeManualBook(
  page: Page,
  title: string,
  submit: string,
  screenshotName?: string,
) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Add manually/ }).click();
  await dialog.getByLabel('Title', { exact: true }).fill(title);
  const authorInput = dialog.getByRole('combobox', {
    name: 'Author',
    exact: true,
  });
  await authorInput.fill('Responsive Author');
  await authorInput.press('Tab');
  await expect(authorInput).toHaveValue('Responsive Author');
  await dialog.getByLabel('Pages').fill('180');
  const categoryTrigger = dialog.getByRole('button', {
    name: 'Show categories',
  });
  await categoryTrigger.scrollIntoViewIfNeeded();
  await categoryTrigger.click();
  const categoryOption = page.getByRole('option', {
    name: 'Other',
    exact: true,
  });
  await expect(categoryOption).toBeVisible();
  await categoryOption.click();
  const opinion = dialog.getByLabel(/^Opinion/);
  await opinion.fill('Una opinión breve para comprobar el formulario móvil.');
  await opinion.scrollIntoViewIfNeeded();
  await expect(opinion).toBeInViewport();
  await expectNoDialogOverflow(page);
  if (screenshotName) {
    await page.screenshot({
      path: test.info().outputPath(screenshotName),
      fullPage: false,
      animations: 'disabled',
    });
  }
  const submitButton = dialog.getByRole('button', { name: submit });
  await submitButton.scrollIntoViewIfNeeded();
  await expect(submitButton).toBeInViewport();
  await expectNoDialogOverflow(page);
  await submitButton.click();
  await expect(dialog).toBeHidden();
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} layout`, () => {
    test.use({ viewport });

    test('login and every application screen fit the viewport', async ({
      page,
    }) => {
      await page.goto('/login');
      await expect(
        page.getByRole('heading', { name: 'Book Recorder' }),
      ).toBeVisible();
      await expect(page.getByLabel('Password')).toBeInViewport();
      await expectNoPageOverflow(page);
      if (viewport.capture) {
        await page.screenshot({
          path: test.info().outputPath(`${viewport.name}-login.png`),
          fullPage: true,
        });
      }

      await unlock(page);
      for (const screen of SCREENS) {
        await page.goto(screen.path);
        await expect(
          page.getByRole('heading', { name: screen.heading, level: 1 }),
        ).toBeVisible();
        await expect(
          page.getByRole('navigation', { name: 'Main' }),
        ).toBeVisible();
        if (screen.path === '/graphs') {
          await expect(page.locator('.recharts-surface').first()).toBeVisible();
          // Recharts' default entrance animation lasts 1500 ms; capture the
          // completed geometry instead of the initial empty SVG containers.
          await page.waitForTimeout(1_600);
          await expect
            .poll(async () => {
              const bar = page.locator('.recharts-bar-rectangle path').first();
              const box = await bar.boundingBox();
              return box !== null && box.height > 0;
            })
            .toBe(true);
        }
        await expectNoPageOverflow(page);
        if (viewport.capture) {
          const masks =
            screen.path === '/skill'
              ? [
                  page
                    .locator('article', {
                      has: page.getByRole('heading', {
                        name: 'Connection details',
                      }),
                    })
                    .locator('code'),
                ]
              : [];
          await page.screenshot({
            path: test
              .info()
              .outputPath(`${viewport.name}-${screen.path.slice(1)}.png`),
            fullPage: true,
            mask: masks,
          });
        }
      }
    });

    test('book forms and confirmation dialogs remain usable', async ({
      page,
    }) => {
      await unlock(page);
      await page.getByRole('button', { name: 'Add book' }).click();

      const addDialog = page.getByRole('dialog');
      await expect(addDialog).toBeVisible();
      await expect(
        addDialog.getByRole('button', { name: 'Search' }),
      ).toBeInViewport();
      await expectNoPageOverflow(page);
      await expectNoDialogOverflow(page);
      if (viewport.capture) {
        await page.screenshot({
          path: test
            .info()
            .outputPath(`${viewport.name}-add-search-dialog.png`),
          fullPage: false,
          animations: 'disabled',
        });
      }
      const finishedTitle = `Responsive finished ${viewport.name}`;
      await completeManualBook(
        page,
        finishedTitle,
        'Save book',
        viewport.capture ? `${viewport.name}-add-manual-dialog.png` : undefined,
      );

      const finishedCard = page
        .locator('li.lib-card', {
          hasText: finishedTitle,
        })
        .last();
      await finishedCard.getByRole('button', { name: 'Edit' }).click();
      const editDialog = page.getByRole('dialog', { name: 'Edit book' });
      await expect(editDialog).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoDialogOverflow(page);
      if (viewport.capture) {
        await page.screenshot({
          path: test.info().outputPath(`${viewport.name}-edit-dialog.png`),
          fullPage: false,
          animations: 'disabled',
        });
      }
      await editDialog.getByRole('button', { name: 'Cancel' }).click();

      await finishedCard.getByRole('button', { name: 'Delete' }).click();
      const deleteDialog = page.getByRole('dialog', { name: 'Delete book?' });
      await expect(deleteDialog).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoDialogOverflow(page);
      if (viewport.capture) {
        await page.screenshot({
          path: test.info().outputPath(`${viewport.name}-delete-dialog.png`),
          fullPage: false,
          animations: 'disabled',
        });
      }
      await deleteDialog.getByRole('button', { name: 'Cancel' }).click();

      await page.goto('/to-read');
      await page.getByRole('button', { name: 'Add to read' }).click();
      const queuedTitle = `Responsive queued ${viewport.name}`;
      await completeManualBook(
        page,
        queuedTitle,
        'Save to read',
        viewport.capture
          ? `${viewport.name}-to-read-manual-dialog.png`
          : undefined,
      );

      const queuedCard = page
        .locator('li.lib-card', { hasText: queuedTitle })
        .last();
      await queuedCard.getByRole('button', { name: 'Mark finished' }).click();
      const finishDialog = page.getByRole('dialog', {
        name: 'Mark as finished',
      });
      await expect(finishDialog).toBeVisible();
      await expectNoPageOverflow(page);
      await expectNoDialogOverflow(page);
      if (viewport.capture) {
        await page.screenshot({
          path: test.info().outputPath(`${viewport.name}-finish-dialog.png`),
          fullPage: false,
          animations: 'disabled',
        });
      }
      await page.keyboard.press('Escape');
      await expect(finishDialog).toBeHidden();
    });
  });
}
