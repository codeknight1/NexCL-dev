import { nextjs } from '@devcms/eslint-config/next';

export default [
  ...nextjs,
  {
    ignores: ['.next/**'],
  },
];

