import type { CMSAdapter } from './adapter';
import { createLocalStorageAdapter, createMemoryAdapter } from './adapter';
import { createCMSStore } from './cmsStore';

let _store: ReturnType<typeof createCMSStore> | null = null;

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

