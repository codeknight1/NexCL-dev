'use client';

import { Search, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';

export interface ToolbarContext {
  query: string;
  setQuery: (value: string) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  selectedCount: number;
  bulkClear: () => Promise<void> | void;
  selectAllOnPage: () => void;
  clearSelection: () => void;
}

export function Toolbar(props: { context: ToolbarContext }) {
  const {
    query,
    setQuery,
    page,
    pageCount,
    setPage,
    selectedCount,
    bulkClear,
    selectAllOnPage,
    clearSelection,
  } = props.context;

  return (
    <section className="mb-4 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="search"
            className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Filter by canonical key…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={selectAllOnPage}>
            Select page
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Clear selection
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void bulkClear()}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4" />
            Bulk clear ({selectedCount})
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

