export type CmsDoc = Record<string, unknown>;

export interface CmsStorage {
  readAll(): Promise<CmsDoc>;
  patchKey(canonicalKey: string, value: unknown): Promise<void>;
}

