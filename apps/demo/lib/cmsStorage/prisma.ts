import { PrismaClient } from '@prisma/client';
import { sanitizeRichText, validateKey } from '@devcms/core/server';

import type { CmsDoc, CmsStorage } from './types';

const prisma = new PrismaClient();

export function createPrismaCmsStorage(): CmsStorage {
  return {
    async readAll(): Promise<CmsDoc> {
      const rows = await prisma.cmsEntry.findMany();
      const doc: CmsDoc = {};
      for (const row of rows) {
        const canonical = row.locale ? `${row.key}@${row.locale}` : row.key;
        doc[canonical] = row.value as unknown;
      }
      return doc;
    },

    async patchKey(canonicalKey: string, value: unknown): Promise<void> {
      const { key, locale, namespace, path } = parseCanonicalKeyOrThrow(canonicalKey);
      const v = validateKey(path, { namespace });
      if (!v.ok) throw new Error(v.message);

      const safeValue = sanitizeIncomingValue(value);

      await prisma.cmsEntry.upsert({
        where: { key_locale: { key, locale } },
        create: { key, namespace, path, locale, value: safeValue as any, version: 1 },
        update: { value: safeValue as any, version: { increment: 1 } },
      });
    },
  };
}

export function parseCanonicalKeyOrThrow(canonicalKey: string): {
  key: string;
  locale: string | null;
  namespace: string;
  path: string;
} {
  // Supports optional locale suffix: "namespace:path@en"
  const at = canonicalKey.lastIndexOf('@');
  const base = at > -1 ? canonicalKey.slice(0, at) : canonicalKey;
  const locale = at > -1 ? canonicalKey.slice(at + 1) : null;

  const idx = base.indexOf(':');
  if (idx <= 0 || idx === base.length - 1) {
    throw new Error('Canonical key must be in the form "namespace:path".');
  }
  const namespace = base.slice(0, idx);
  const path = base.slice(idx + 1);
  return { key: base, locale, namespace, path };
}

function sanitizeIncomingValue(value: unknown): unknown {
  if (typeof value === 'string' && value.includes('<')) {
    return sanitizeRichText(value);
  }
  return value;
}

