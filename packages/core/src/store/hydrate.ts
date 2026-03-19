import type { CMSRecord } from './adapter';
import { getCMSStore } from './instance';

/**
 * Replace the in-memory CMS snapshot with a server-provided snapshot.
 *
 * Intended for sync systems (polling/SSE/etc). This does not validate keys or values
 * because the server is expected to do so; clients should still sanitize on render.
 */
export function hydrateCMS(values: CMSRecord) {
  const store = getCMSStore();
  store.getState().setValues(values);
}

