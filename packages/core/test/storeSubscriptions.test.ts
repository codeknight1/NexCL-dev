import { describe, expect, it } from 'vitest';

import { createMemoryAdapter } from '../src/store/adapter';
import { createCMSStore } from '../src/store/cmsStore';

describe('store subscriptions', () => {
  it('does not change unrelated keys when setting one key', () => {
    const store = createCMSStore(createMemoryAdapter({ 'default:a': 1, 'default:b': 2 }));
    store.getState().setValue('default:a' as any, 3);
    expect(store.getState().values['default:a']).toBe(3);
    expect(store.getState().values['default:b']).toBe(2);
  });
});

