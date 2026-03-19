'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '../ui/button';

interface LayoutShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function LayoutShell(props: LayoutShellProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">{props.title}</h1>
            {props.subtitle ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{props.subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">/admin/cms</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDark((v) => !v)}
              aria-pressed={dark}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {dark ? 'Light' : 'Dark'}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{props.children}</main>
    </div>
  );
}

