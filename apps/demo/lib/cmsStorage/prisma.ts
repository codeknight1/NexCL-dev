import { PrismaClient, type Prisma } from '@prisma/client';
import { sanitizeRichText, validateKey } from '@devcms/core/server';

import type { CmsDoc, CmsStorage } from './types';

const prisma = new PrismaClient();

export function createPrismaCmsStorage(): CmsStorage {
  return {
    async readAll(): Promise<CmsDoc> {
      const rows = await prisma.cmsEntry.findMany();
      const doc: CmsDoc = {};
      for (const row of rows) {
        const canonical =
          row.locale !== null && row.locale !== '' ? `${row.key}@${row.locale}` : row.key;
        doc[canonical] = row.value as unknown;
      }
      return doc;
    },

    async patchKey(canonicalKey: string, value: unknown): Promise<void> {
      const { key, locale, namespace, path } = parseCanonicalKeyOrThrow(canonicalKey);
      const v = validateKey(path, { namespace });
      if (!v.ok) throw new Error(v.message);

      const safeValue = sanitizeIncomingValue(value);
      const jsonValue = toInputJsonValue(safeValue);

      // Prisma compound unique `key_locale`: locale is optional in schema; generated
      // where-input types can be stricter than runtime (null vs string).
      await prisma.cmsEntry.upsert({
        where: { key_locale: { key, locale } },
        create: { key, namespace, path, locale, value: jsonValue, version: 1 },
        update: { value: jsonValue, version: { increment: 1 } },
      } as Parameters<typeof prisma.cmsEntry.upsert>[0]);
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

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === undefined) {
    // JSON column null; Prisma.InputJsonValue typing varies by version
    return null as unknown as Prisma.InputJsonValue;
  }
  try {
    const json = JSON.stringify(value);
    if (typeof json !== 'string') {
      return null as unknown as Prisma.InputJsonValue;
    }
    return JSON.parse(json) as Prisma.InputJsonValue;
  } catch {
    return null as unknown as Prisma.InputJsonValue;
  }
}
