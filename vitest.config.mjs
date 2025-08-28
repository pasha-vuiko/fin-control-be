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
    },
    coverage: {
      provider: 'v8',
      // Only consider source files for coverage
      include: ['src/**/*.ts'],
      // Do not attempt to include all files automatically; only those touched (and not excluded)
      all: false,
      clean: true,
      cleanOnRerun: true,
      // Exclude files without business logic from coverage metrics
      exclude: [
        // Test files and setup
        '**/*.spec.ts',
        'test/**',
        // DTOs, entities, interfaces, types, enums, constants
        'src/**/*.dto.ts',
        'src/**/dto/**',
        'src/**/entities/**',
        'src/**/interfaces/**',
        'src/**/types/**',
        'src/**/enums/**',
        'src/**/constants/**',
        // Repositories (data access wrappers)
        'src/**/repositories/**',
        // Controllers (thin transport layer)
        'src/**/controllers/**',
        // Nest modules and app/bootstrap/setup files
        'src/**/*.module.ts',
        'src/main.ts',
        'src/app.config.ts',
        'src/app.module.ts',
        'src/app.controller.ts',
        'src/shared/bootstrap/**',
      ],
      reporter: ['text', 'text-summary', 'html', 'lcov'],
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
