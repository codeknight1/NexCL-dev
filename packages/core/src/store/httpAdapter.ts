import type { CMSAdapter, CMSRecord } from './adapter';

export interface HttpAdapterOptions {
  /** Base URL for CMS API. Example: `/api/cms` */
  baseUrl: string;
  /** Custom fetch implementation (useful for tests). */
  fetcher?: typeof fetch;
}

/**
 * HTTP adapter for DevCMS.
 *
 * - `read()` loads the full CMS document from `GET {baseUrl}`
 * - `patch(key,value)` persists a single key via `PATCH {baseUrl}/{encodeURIComponent(key)}`
 *
 * This adapter is intentionally optimistic: callers are expected to update UI
 * immediately; server errors are logged and can be handled in later stages.
 */
export function createHttpAdapter(opts: HttpAdapterOptions): CMSAdapter {
  const fetcher = opts.fetcher ?? fetch;

  return {
    read() {
      // `read()` is sync by contract; return empty and let apps optionally
      // hydrate in their own bootstrapping code (Stage 3 keeps it simple).
      return {};
    },
    async patch(key, value) {
      await fetcher(`${stripTrailingSlash(opts.baseUrl)}/${encodeURIComponent(key)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value }),
      });
    },
    write(values: CMSRecord) {
      // Not used when patch exists; keep no-op to satisfy interface.
      void values;
    },
  };
}

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

