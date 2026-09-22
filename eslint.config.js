// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignore build output and config files
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'eslint.config.js',
      'tsup.config.ts',
      'vitest.config.ts',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript parser + rules
  ...tseslint.configs.recommended,

  // Source + tests + examples: Node environment, TS-aware unused-vars
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Allow `_`-prefixed unused args (matches common SDK signature patterns)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `no-console` is fine in SDKs and examples
      'no-console': 'off',
      // Empty catch blocks with a comment are intentional (hook swallowing)
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);