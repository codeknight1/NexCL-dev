import { describe, expect, it } from 'vitest';

import { sanitizeRichText } from '../src/sanitize';

describe('sanitizeRichText', () => {
  it('removes scripts and event handlers', () => {
    const dirty =
      '<p>Hello</p><script>alert(1)</script><img src=x onerror="alert(1)" /><a href="javascript:alert(1)">x</a>';
    const cleaned = sanitizeRichText(dirty);
    expect(cleaned).toContain('<p>Hello</p>');
    expect(cleaned).not.toContain('<script');
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('javascript:');
  });

  it('forces safe rel on links', () => {
    const cleaned = sanitizeRichText('<a href="https://example.com" target="_blank">ok</a>');
    expect(cleaned).toContain('rel="noopener noreferrer"');
  });
});

