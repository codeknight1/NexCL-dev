'use client';

import { useState } from 'react';

import { Button } from '../ui/button';

export interface CmsRow {
  key: string;
  value: unknown;
}

interface CmsTableProps {
  loading: boolean;
  error: string | null;
  rows: CmsRow[];
  selectedKeys: string[];
  toggleSelect: (key: string) => void;
  upsertValue: (key: string, value: unknown) => void;
}

export function CmsTable(props: CmsTableProps) {
  const { loading, error, rows, selectedKeys, toggleSelect, upsertValue } = props;

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm dark:border-zinc-700">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Failed to load CMS data: {error}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        No CMS entries found yet. Edit inline content on the site to populate values.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-950/50 dark:text-zinc-400">
          <tr>
            <th className="w-10 px-3 py-2">Sel</th>
            <th className="w-72 px-3 py-2">Key</th>
            <th className="px-3 py-2">Value</th>
            <th className="w-32 px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CmsRowItem
              key={row.key}
              row={row}
              selected={selectedKeys.includes(row.key)}
              toggleSelect={toggleSelect}
              upsertValue={upsertValue}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CmsRowItem(props: {
  row: CmsRow;
  selected: boolean;
  toggleSelect: (key: string) => void;
  upsertValue: (key: string, value: unknown) => void;
}) {
  const [draft, setDraft] = useState<string>(() =>
    typeof props.row.value === 'string' ? props.row.value : JSON.stringify(props.row.value ?? ''),
  );
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/cms/${encodeURIComponent(props.row.key)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value: draft }),
      });
      props.upsertValue(props.row.key, draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-t border-zinc-100 align-top last:border-b dark:border-zinc-800">
      <td className="px-3 py-2 align-middle">
        <input
          type="checkbox"
          className="h-3.5 w-3.5"
          checked={props.selected}
          onChange={() => {
            props.toggleSelect(props.row.key);
          }}
          aria-label={`Select ${props.row.key}`}
        />
      </td>
      <td className="px-3 py-2 align-middle font-mono text-xs text-zinc-600 dark:text-zinc-400">
        {props.row.key}
      </td>
      <td className="px-3 py-2">
        <textarea
          className="h-20 w-full resize-y rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-mono text-zinc-800 outline-none ring-zinc-400 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
        />
      </td>
      <td className="px-3 py-2 text-right align-middle">
        <Button type="button" size="sm" variant="outline" onClick={() => void onSave()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </td>
    </tr>
  );
}

