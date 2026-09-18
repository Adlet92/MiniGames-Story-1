import js from '@eslint/js';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  {
    files: ['src/**/*.ts'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      unicorn.configs.recommended,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    linterOptions: {
      noInlineConfig: true,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',

      '@typescript-eslint/typedef': [
        'error',
        {
          arrowParameter: true,
          parameter: true,
          propertyDeclaration: true,
          memberVariableDeclaration: true,
          variableDeclaration: true,
          arrayDestructuring: true,
          objectDestructuring: true,
        },
      ],

      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
]);
