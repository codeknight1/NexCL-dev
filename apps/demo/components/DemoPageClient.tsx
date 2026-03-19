'use client';

import { InlineRichText, InlineText, useCMSEditMode } from '@devcms/core';
import { Pencil, PencilOff } from 'lucide-react';

import { Button } from './ui/button';

export function DemoPageClient() {
  const { isEditing, toggleEditMode } = useCMSEditMode();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">DevCMS</p>
          <h1 className="text-2xl font-semibold text-zinc-900">Inline-first CMS demo</h1>
        </div>
        <Button
          type="button"
          variant={isEditing ? 'outline' : 'default'}
          onClick={toggleEditMode}
          aria-pressed={isEditing}
        >
          {isEditing ? <PencilOff className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {isEditing ? 'Exit edit mode' : 'Enter edit mode'}
        </Button>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-zinc-500">Hero</h2>
        <div className="space-y-3">
          <div className="text-3xl font-semibold leading-tight">
            <InlineText path="homepage.hero.title" fallback="Welcome" namespace="marketing" />
          </div>
          <div className="prose prose-zinc max-w-none">
            <InlineRichText
              path="homepage.hero.subtitle"
              fallback="<p>The inline-first CMS for Next.js.</p>"
              namespace="marketing"
            />
          </div>
        </div>
      </section>

      <footer className="mt-8 text-sm text-zinc-600">
        <p>
          Hotkey: <kbd className="rounded border bg-zinc-50 px-2 py-1">Ctrl/Cmd</kbd> +{' '}
          <kbd className="rounded border bg-zinc-50 px-2 py-1">Shift</kbd> +{' '}
          <kbd className="rounded border bg-zinc-50 px-2 py-1">E</kbd>
        </p>
      </footer>
    </main>
  );
}

