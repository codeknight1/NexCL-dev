import { describe, expect, it } from 'vitest';

import { createLocalStorageAdapter, createMemoryAdapter } from '../src/store/adapter';
import { createCMSStore } from '../src/store/cmsStore';
import type { StorageLike } from '../src/store/adapter';

describe('persistence adapters', () => {
  it('memory adapter round-trips values', () => {
    const adapter = createMemoryAdapter();
    const store = createCMSStore(adapter);
    store.getState().setValue('default:a.b' as any, 'x');
    const reloaded = createCMSStore(adapter);
    expect(reloaded.getState().values['default:a.b']).toBe('x');
  });

  it('localStorage adapter reads/writes JSON safely', () => {
    const memoryStorage = createFakeStorage();
    const adapter = createLocalStorageAdapter({ storageKey: 'k', storage: memoryStorage });
    const store = createCMSStore(adapter);
    store.getState().setValue('default:hero.title' as any, 'Hello');
    expect(JSON.parse(memoryStorage.getItem('k') ?? '{}')).toMatchObject({
      'default:hero.title': 'Hello',
    });
  });
});

function createFakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem(key) {
      return map.get(key) ?? null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

