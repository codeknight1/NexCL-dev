import type { CmsDoc } from './types';
import type { CmsStorage } from './types';

import { patchCmsKey, readCmsDoc } from '../cmsFileStore';

export function createFileCmsStorage(): CmsStorage {
  return {
    async readAll(): Promise<CmsDoc> {
      return await readCmsDoc();
    },
    async patchKey(canonicalKey, value) {
      await patchCmsKey(canonicalKey, value);
    },
  };
}

