import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'c8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html'],
    },
  },
});
