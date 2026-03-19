import type { CMSAdapter } from './adapter';
import { createLocalStorageAdapter, createMemoryAdapter } from './adapter';
import { createCMSStore } from './cmsStore';

let _store: ReturnType<typeof createCMSStore> | null = null;

/**
 * Initialize the global CMS store.
 *
 * Apps can call this once at startup to select a persistence adapter (e.g. HTTP).
 * If not called, the runtime falls back to `localStorage` in the browser and an
 * in-memory adapter on the server.
 */
export function initCMS(opts: { adapter: CMSAdapter }) {
  _store = createCMSStore(opts.adapter);
  return _store;
}

export function getCMSStore(opts?: { adapter?: CMSAdapter }) {
  if (_store) return _store;

  const adapter =
    opts?.adapter ??
    (typeof window !== 'undefined' ? createLocalStorageAdapter() : createMemoryAdapter());

  _store = createCMSStore(adapter);
  return _store;
}

export function resetCMSStoreForTests() {
  _store = null;
}

