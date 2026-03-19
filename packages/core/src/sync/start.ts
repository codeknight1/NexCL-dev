import type { CMSRecord } from '../store/adapter';
import { hydrateCMS } from '../store/hydrate';

import type { CMSSyncTransport } from './transport';
import { createPollingTransport, type PollingTransportOptions } from './polling';
import { createSseTransport, type SseTransportOptions } from './sse';

export type CMSSyncMode = 'polling' | 'sse';

export interface StartCMSSyncOptions {
  /** Default: `/api/cms` */
  baseUrl?: string;
  /** Default: `polling` */
  mode?: CMSSyncMode;
  /** Polling interval (ms). Only used for polling mode. */
  intervalMs?: number;
  /** Dependency injection (tests). */
  fetcher?: typeof fetch;
  /** Dependency injection (tests/polyfills). */
  eventSource?: typeof EventSource;
}

/**
 * Start a background sync loop that keeps the local CMS store updated.
 *
 * Default behavior is polling `GET /api/cms` and hydrating the local store with
 * the latest snapshot. This enables cross-tab and admin→frontend propagation.
 */
export function startCMSSync(opts?: StartCMSSyncOptions): () => void {
  const baseUrl = opts?.baseUrl ?? '/api/cms';
  const mode: CMSSyncMode = opts?.mode ?? 'polling';

  const transport = createTransport(mode, {
    baseUrl,
    intervalMs: opts?.intervalMs,
    fetcher: opts?.fetcher,
    eventSource: opts?.eventSource,
  });

  return transport.start((snapshot) => {
    hydrateCMS(snapshot as CMSRecord);
  });
}

function createTransport(
  mode: CMSSyncMode,
  deps: {
    baseUrl: string;
    intervalMs?: number;
    fetcher?: typeof fetch;
    eventSource?: typeof EventSource;
  },
): CMSSyncTransport {
  if (mode === 'sse') {
    const hasES =
      typeof deps.eventSource !== 'undefined' ||
      (typeof window !== 'undefined' && typeof window.EventSource !== 'undefined');
    if (!hasES) {
      // Fail-safe: if SSE isn't available, fall back to polling.
      mode = 'polling';
    } else {
    const sseOpts: SseTransportOptions = { url: `${stripTrailingSlash(deps.baseUrl)}/stream` };
    if (deps.eventSource) sseOpts.eventSource = deps.eventSource;
    return createSseTransport(sseOpts);
    }
  }

  const pollOpts: PollingTransportOptions = { url: deps.baseUrl, intervalMs: deps.intervalMs };
  if (deps.fetcher) pollOpts.fetcher = deps.fetcher;
  return createPollingTransport(pollOpts);
}

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

