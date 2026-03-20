import next from '@next/eslint-plugin-next';

import { react } from './react.ts';

/**
 * DevCMS ESLint config for Next.js projects.
 */
export const nextjs = [
  ...react,
  {
    plugins: {
      '@next/next': next,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
    },
  },
];

