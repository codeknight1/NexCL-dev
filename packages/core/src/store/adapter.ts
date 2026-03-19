export type CMSRecord = Record<string, unknown>;

export interface CMSAdapter {
  /** Read all persisted CMS values. */
  read(): CMSRecord;
  /** Persist all CMS values. */
  write(values: CMSRecord): void;
}

export function createMemoryAdapter(initial?: CMSRecord): CMSAdapter {
  let state: CMSRecord = { ...(initial ?? {}) };
  return {
    read() {
      return { ...state };
    },
    write(values) {
      state = { ...values };
    },
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createLocalStorageAdapter(opts?: {
  storageKey?: string;
  storage?: StorageLike;
}): CMSAdapter {
  const storageKey = opts?.storageKey ?? 'devcms';
  const storage =
    opts?.storage ??
    (typeof window !== 'undefined' ? (window.localStorage as StorageLike) : undefined);

  return {
    read() {
      if (!storage) return {};
      const raw = storage.getItem(storageKey);
      if (!raw) return {};
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== 'object') return {};
        return parsed as CMSRecord;
      } catch {
        return {};
      }
    },
    write(values) {
      if (!storage) return;
      storage.setItem(storageKey, JSON.stringify(values));
    },
  };
}

