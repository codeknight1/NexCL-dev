import { describe, expect, it } from 'vitest';

import type { CMSPath } from '../src';

describe('core smoke', () => {
  it('re-exports CMSPath type', () => {
    const v: CMSPath = 'homepage.hero.title';
    expect(v).toContain('hero');
  });
});

