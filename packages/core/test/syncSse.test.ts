import { describe, expect, it, vi } from 'vitest';

import { createSseTransport } from '../src/sync/sse';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  listeners = new Map<string, Set<(e: any) => void>>();
  closed = false;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, cb: (e: any) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(cb);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, cb: (e: any) => void) {
    this.listeners.get(type)?.delete(cb);
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data: unknown) {
    const event = { data: typeof data === 'string' ? data : JSON.stringify(data) };
    for (const cb of this.listeners.get(type) ?? []) cb(event);
  }
}

describe('sse transport', () => {
  it('parses message events as snapshots', () => {
    const onSnapshot = vi.fn();
    const transport = createSseTransport({ url: '/api/cms/stream', eventSource: FakeEventSource as any });
    const stop = transport.start(onSnapshot);

    const es = FakeEventSource.instances[0];
    expect(es?.url).toBe('/api/cms/stream');

    es?.emit('message', { a: 1 });
    expect(onSnapshot).toHaveBeenCalledWith({ a: 1 });

    stop();
    expect(es?.closed).toBe(true);
  });
});

