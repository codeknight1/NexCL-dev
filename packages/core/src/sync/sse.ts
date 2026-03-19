import type { CMSSyncTransport } from './transport';

export interface SseTransportOptions {
  /** Example: `/api/cms/stream` */
  url: string;
  /** EventSource implementation (tests/polyfills). */
  eventSource?: typeof EventSource;
}

/**
 * SSE transport (optional).
 *
 * Expects the server to send `message` events with a JSON-encoded snapshot.
 */
export function createSseTransport(opts: SseTransportOptions): CMSSyncTransport {
  const ES = opts.eventSource ?? (typeof window !== 'undefined' ? window.EventSource : undefined);

  return {
    start(onSnapshot) {
      if (!ES) return () => {};

      const es = new ES(opts.url);
      const onMessage = (e: MessageEvent) => {
        try {
          const snapshot = JSON.parse(String(e.data)) as Record<string, unknown>;
          onSnapshot(snapshot);
        } catch {
          // ignore
        }
      };
      es.addEventListener('message', onMessage);

      return () => {
        es.removeEventListener('message', onMessage);
        es.close();
      };
    },
  };
}

