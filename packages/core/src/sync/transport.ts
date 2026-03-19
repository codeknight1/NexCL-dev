export type CMSSnapshot = Record<string, unknown>;

export interface CMSSyncTransport {
  /**
   * Start emitting snapshots.
   *
   * Returns a cleanup function that stops the transport.
   */
  start(onSnapshot: (snapshot: CMSSnapshot) => void): () => void;
}

