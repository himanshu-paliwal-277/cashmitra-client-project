// ESLint v9 Flat Config (ESM)

import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // ⛔ Ignore folders
  {
    ignores: ['node_modules', 'dist', 'build', 'public', 'vite.config.js'],
  },

  // ✅ Base JS rules
  js.configs.recommended,

  // ✅ React + JSX support
  {
    files: ['src/**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      // 🔥 REQUIRED for JSX to work (your missing part)
      ecmaFeatures: {
        jsx: true,
      },

      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        URLSearchParams: 'readonly',
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
    },

    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
