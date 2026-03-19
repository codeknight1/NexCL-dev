import { describe, expect, it } from 'vitest';

import type { CMSPath } from '../src';

describe('types smoke', () => {
  it('compiles CMSPath type', () => {
    const v: CMSPath = 'a.b.c';
    expect(v).toBe('a.b.c');
  });
});

