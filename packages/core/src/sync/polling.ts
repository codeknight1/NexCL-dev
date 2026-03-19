import type { CMSSyncTransport, CMSSnapshot } from './transport';

export interface PollingTransportOptions {
  /** Example: `/api/cms` */
  url: string;
  /** Polling interval (ms). Default: 2000 */
  intervalMs?: number;
  /** Custom fetch implementation (tests). */
  fetcher?: typeof fetch;
}

/**
 * Polling transport (default).
 *
 * Fetches a full snapshot periodically from a GET endpoint.
 */
export function createPollingTransport(opts: PollingTransportOptions): CMSSyncTransport {
  const intervalMs = opts.intervalMs ?? 2000;
  const fetcher = opts.fetcher ?? fetch;

  return {
    start(onSnapshot) {
      let stopped = false;
      let timer: ReturnType<typeof setInterval> | null = null;
      let lastJson: string | null = null;

      const tick = async () => {
        try {
          const res = await fetcher(opts.url, { cache: 'no-store' } as any);
          if (!res.ok) return;
          const snapshot = (await res.json()) as CMSSnapshot;
          const json = safeStableStringify(snapshot);
          if (json !== null && json === lastJson) return;
          lastJson = json;
          if (!stopped) onSnapshot(snapshot);
        } catch {
          // Swallow errors: polling should be resilient and never crash the app.
        }
      };

      void tick();
      timer = setInterval(() => void tick(), intervalMs);

      return () => {
        stopped = true;
        if (timer) clearInterval(timer);
      };
    },
  };
}

function safeStableStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

