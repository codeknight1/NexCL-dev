import { react } from '@devcms/eslint-config/react';

export default [
  ...react,
  {
    ignores: ['dist/**'],
  },
];

