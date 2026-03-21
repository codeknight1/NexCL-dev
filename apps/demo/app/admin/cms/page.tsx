'use client';

import { useEffect, useMemo, useState } from 'react';

import { CmsTable, type CmsRow } from '../../../components/admin/CmsTable';
import { LayoutShell } from '../../../components/admin/LayoutShell';
import { Toolbar, type ToolbarContext } from '../../../components/admin/Toolbar';

type CmsDoc = Record<string, unknown>;

export default function AdminCmsPage() {
  const [data, setData] = useState<CmsDoc>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cms', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
      const json = (await res.json()) as CmsDoc;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const rows: CmsRow[] = useMemo(() => {
    const entries = Object.entries(data);
    const filtered = query
      ? entries.filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
      : entries;
    return filtered.map(([key, value]) => ({ key, value }));
  }, [data, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const pagedRows = rows.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const selectAllOnPage = () => {
    const pageKeys = pagedRows.map((r) => r.key);
    setSelectedKeys((prev) => {
      const set = new Set(prev);
      for (const k of pageKeys) set.add(k);
      return Array.from(set);
    });
  };

  const clearSelection = () => {
    setSelectedKeys([]);
  };

  const upsertValue = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const bulkClear = async () => {
    if (!selectedKeys.length) return;
    const keys = [...selectedKeys];
    clearSelection();
    await Promise.all(
      keys.map(async (canonical) => {
        await fetch(`/api/cms/${encodeURIComponent(canonical)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ value: '' }),
        });
        upsertValue(canonical, '');
      }),
    );
  };

  const toolbarContext: ToolbarContext = {
    query,
    setQuery,
    page: clampedPage,
    pageCount,
    setPage,
    selectedCount: selectedKeys.length,
    bulkClear,
    selectAllOnPage,
    clearSelection,
  };

  return (
    <LayoutShell title="CMS content" subtitle="Search, inspect, and bulk-edit DevCMS values.">
      <Toolbar context={toolbarContext} />
      <CmsTable
        loading={loading}
        error={error}
        rows={pagedRows}
        selectedKeys={selectedKeys}
        toggleSelect={toggleSelect}
        upsertValue={upsertValue}
      />
    </LayoutShell>
  );
}

