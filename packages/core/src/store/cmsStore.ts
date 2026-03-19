import { createStore } from 'zustand/vanilla';

import type { CanonicalKey } from '../key';

import type { CMSAdapter, CMSRecord } from './adapter';

export type CMSValue = unknown;

export interface CMSState {
  values: CMSRecord;
  setValue: (key: CanonicalKey, value: CMSValue) => void;
  setValues: (next: CMSRecord) => void;
  clear: () => void;
}

export function createCMSStore(adapter: CMSAdapter) {
  const initial = adapter.read();

  const store = createStore<CMSState>((set, get) => ({
    values: initial,
    setValue(key, value) {
      const prev = get().values;
      const next = { ...prev, [key]: value };
      set({ values: next });
      if (adapter.patch) {
        void adapter.patch(key, value);
        return;
      }
      adapter.write(next);
    },
    setValues(next) {
      set({ values: { ...next } });
      adapter.write(next);
    },
    clear() {
      set({ values: {} });
      adapter.write({});
    },
  }));

  return store;
}

