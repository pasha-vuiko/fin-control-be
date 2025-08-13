import path from 'node:path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, 'test', 'unit-tests-setup.ts')],
    root: './',
    alias: {
      '@api': './src/api',
      '@shared': './src/shared',
      '@prisma-definitions': './prisma',
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});
