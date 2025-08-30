import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import securityPlugin from 'eslint-plugin-security';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default [
  securityPlugin.configs.recommended,
  prettierRecommended,
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      'max-lines-per-function': ['error', 40],
      // Interface naming: allow PascalCase with or without leading I.
      // Implementable interfaces may keep `I` prefix; type-only should not.
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es6,
      },
    },
  },
];
