import { randomInt } from 'node:crypto';
import { test as base } from '@playwright/test';
export * from '@playwright/test';

/** Gives isolated test browsers distinct proxy IPs while exercising the real database-backed limiter. */
export const test = base.extend<{ isolatedIp: void }>({
  isolatedIp: [
    async ({ context }, use) => {
      await context.setExtraHTTPHeaders({
        'x-real-ip': `198.18.${randomInt(1, 255)}.${randomInt(1, 255)}`,
      });
      await use();
    },
    { auto: true },
  ],
});
