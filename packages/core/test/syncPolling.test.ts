import { describe, expect, it, vi } from 'vitest';

import { createPollingTransport } from '../src/sync/polling';

describe('polling transport', () => {
  it('fetches snapshots and emits when changed', async () => {
    const onSnapshot = vi.fn();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ a: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ a: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ a: 2 }),
      });

    vi.useFakeTimers();
    const transport = createPollingTransport({ url: '/api/cms', intervalMs: 10, fetcher: fetcher as any });
    const stop = transport.start(onSnapshot);

    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();

    expect(onSnapshot).toHaveBeenCalledTimes(2);
    expect(onSnapshot.mock.calls[0]?.[0]).toEqual({ a: 1 });
    expect(onSnapshot.mock.calls[1]?.[0]).toEqual({ a: 2 });

    stop();
    vi.useRealTimers();
  });
});

