import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    testTimeout: 20000,
    environment: 'node',
    setupFiles: './tests/setup.ts',
    env: {
      ...config().parsed,
    },
  },
});
