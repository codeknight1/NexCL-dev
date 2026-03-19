import { describe, expect, it } from 'vitest';

import { parseCanonicalKeyOrThrow } from './prisma';

describe('prisma storage key parsing', () => {
  it('parses base canonical key without locale', () => {
    expect(parseCanonicalKeyOrThrow('marketing:homepage.hero.title')).toMatchObject({
      key: 'marketing:homepage.hero.title',
      locale: null,
      namespace: 'marketing',
      path: 'homepage.hero.title',
    });
  });

  it('parses canonical key with locale suffix', () => {
    expect(parseCanonicalKeyOrThrow('marketing:homepage.hero.title@en')).toMatchObject({
      key: 'marketing:homepage.hero.title',
      locale: 'en',
      namespace: 'marketing',
      path: 'homepage.hero.title',
    });
  });

  it('rejects invalid canonical keys', () => {
    expect(() => parseCanonicalKeyOrThrow('no-colon')).toThrow();
    expect(() => parseCanonicalKeyOrThrow(':a')).toThrow();
    expect(() => parseCanonicalKeyOrThrow('x:')).toThrow();
  });
});

