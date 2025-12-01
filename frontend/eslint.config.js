// ESLint v9 Flat Config (ESM)
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: ['node_modules', 'dist', 'build', 'public', 'vite.config.js'],
  },

  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        URLSearchParams: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly', // ✅ add fetch
        Headers: 'readonly', // optional for fetch API
        Request: 'readonly',
        Response: 'readonly',
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImportsPlugin,
    },

    rules: {
      // 🔹 Unused variables - disable built-in rule in favor of unused-imports plugin
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // 🔹 Unused imports - remove them automatically
      'unused-imports/no-unused-imports': 'warn',

      'no-console': 'off',

      // React
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
