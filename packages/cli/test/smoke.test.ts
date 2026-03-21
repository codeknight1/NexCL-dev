import { describe, expect, it } from 'vitest';

import { runExtract } from '../src';

describe('cli smoke', () => {
  it('exports runExtract', () => {
    expect(typeof runExtract).toBe('function');
  });
});
