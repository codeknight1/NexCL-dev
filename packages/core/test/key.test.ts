import { describe, expect, it } from 'vitest';

import { canonicalKey, validateKey } from '../src/key';

describe('key validation', () => {
  it('builds canonical keys with default namespace', () => {
    expect(canonicalKey('homepage.hero.title')).toBe('default:homepage.hero.title');
  });

  it('supports numeric bracket paths', () => {
    expect(canonicalKey('arr[0].title', { namespace: 'marketing' })).toBe('marketing:arr[0].title');
  });

  it('rejects empty paths', () => {
    const res = validateKey('', { namespace: 'x' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('EMPTY_PATH');
  });

  it('rejects illegal namespace', () => {
    const res = validateKey('a.b', { namespace: 'bad ns' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('INVALID_NAMESPACE');
  });
});

