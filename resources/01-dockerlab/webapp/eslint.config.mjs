import globals from 'globals';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import mocha from 'eslint-plugin-mocha';

export default [
  eslint.configs.recommended,
  mocha.configs.flat.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
      }],
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/no-tabs': ['error'],
      '@stylistic/max-len': ['error', {
        code: 120,
        tabWidth: 2,
      }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', {
        allowSingleLine: false,
      }],
      '@stylistic/no-inner-declarations': 'off',
    },
  },
  {
    files: ['**/*.spec.js'],
    rules: {
      'mocha/no-mocha-arrows': 'off',
    },
  },
];