import type { CmsStorage } from './types';

import { createFileCmsStorage } from './file';

export function getCmsStorage(): CmsStorage {
  if (process.env.DEVCMS_STORAGE !== 'postgres') {
    return createFileCmsStorage();
  }

  let storagePromise: Promise<CmsStorage> | null = null;

  const getPrismaStorage = async (): Promise<CmsStorage> => {
    if (!storagePromise) {
      storagePromise = import('./prisma').then((m) => m.createPrismaCmsStorage());
    }
    return storagePromise;
  };

  return {
    async readAll() {
      const storage = await getPrismaStorage();
      return storage.readAll();
    },
    async patchKey(canonicalKey, value) {
      const storage = await getPrismaStorage();
      return storage.patchKey(canonicalKey, value);
    },
  };
}

