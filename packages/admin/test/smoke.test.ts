import { describe, expect, it } from 'vitest';

import { placeholder } from '../src';

describe('admin smoke', () => {
  it('exports placeholder', () => {
    expect(placeholder).toBe(true);
  });
});

