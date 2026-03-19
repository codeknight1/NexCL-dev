import { describe, expect, it } from 'vitest';

import { placeholder } from '../src';

describe('cli smoke', () => {
  it('exports placeholder', () => {
    expect(placeholder).toBe(true);
  });
});

