import reactHooks from 'eslint-plugin-react-hooks';

import { base } from './base.ts';

/**
 * DevCMS ESLint config for React projects.
 */
export const react = [
  ...base,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];

