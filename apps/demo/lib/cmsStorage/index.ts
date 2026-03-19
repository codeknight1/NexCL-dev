import type { CmsStorage } from './types';

import { createFileCmsStorage } from './file';
import { createPrismaCmsStorage } from './prisma';

export function getCmsStorage(): CmsStorage {
  return process.env.DEVCMS_STORAGE === 'postgres' ? createPrismaCmsStorage() : createFileCmsStorage();
}

