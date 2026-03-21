import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';

import { DemoPageClient } from './DemoPageClient';

describe('DemoPageClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('edits inline fields and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(<DemoPageClient />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /enter edit mode/i }));

    const inlineText = document.querySelector('[data-devcms-inline="text"]');
    expect(inlineText).toBeInstanceOf(HTMLElement);
    if (!(inlineText instanceof HTMLElement)) {
      throw new Error('expected inline text element');
    }
    inlineText.textContent = 'Hello world';
    fireEvent.input(inlineText);

    const inlineRich = document.querySelector('[data-devcms-inline="rich-text"]');
    expect(inlineRich).toBeInstanceOf(HTMLElement);
    if (!(inlineRich instanceof HTMLElement)) {
      throw new Error('expected inline rich-text element');
    }
    inlineRich.innerHTML = `<p>Safe</p><img src="x" onerror="alert(1)" />`;
    fireEvent.input(inlineRich);

    const raw = window.localStorage.getItem('devcms');
    expect(raw).toBeTruthy();
    const json = JSON.parse(raw ?? '{}') as Record<string, unknown>;

    expect(json['marketing:homepage.hero.title']).toBe('Hello world');
    expect(String(json['marketing:homepage.hero.subtitle'])).toContain('<p>Safe</p>');
    expect(String(json['marketing:homepage.hero.subtitle'])).not.toContain('onerror');
    expect(String(json['marketing:homepage.hero.subtitle'])).not.toContain('<img');
  });
});

