// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { parseCanonicalKeyOrThrow } from './cmsFileStore';

describe('cmsFileStore', () => {
  it('parses canonical keys', () => {
    expect(parseCanonicalKeyOrThrow('marketing:homepage.hero.title')).toEqual({
      namespace: 'marketing',
      path: 'homepage.hero.title',
    });
  });

  it('rejects invalid canonical keys', () => {
    expect(() => parseCanonicalKeyOrThrow('no-colon')).toThrow();
    expect(() => parseCanonicalKeyOrThrow(':a.b')).toThrow();
    expect(() => parseCanonicalKeyOrThrow('x:')).toThrow();
  });
});

