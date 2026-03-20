import { readFile, rename, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import { validateKey, sanitizeRichText } from '@devcms/core/server';

export type CmsDoc = Record<string, unknown>;

const CONTENT_PATH = path.join(process.cwd(), '..', '..', 'cms', 'content.json');
const MAX_CANONICAL_LENGTH = 240;
const MAX_VALUE_BYTES = 32_000;

let writeQueue: Promise<void> = Promise.resolve();

export async function readCmsDoc(): Promise<CmsDoc> {
  await ensureCmsDir();
  try {
    const raw = await readFile(CONTENT_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as CmsDoc;
  } catch {
    return {};
  }
}

export async function patchCmsKey(canonical: string, value: unknown): Promise<void> {
  if (canonical.length === 0 || canonical.length > MAX_CANONICAL_LENGTH) {
    throw new Error('Key length is invalid.');
  }
  const { namespace, path: cmsPath } = parseCanonicalKeyOrThrow(canonical);
  const validated = validateKey(cmsPath, { namespace });
  if (!validated.ok) throw new Error(validated.message);

  const safeValue = sanitizeIncomingValue(value);
  assertValueSize(safeValue);

  // Serialize writes to avoid lost updates on concurrent requests.
  writeQueue = writeQueue.then(async () => {
    const doc = await readCmsDoc();
    doc[canonical] = safeValue;
    await atomicWriteJson(CONTENT_PATH, doc);
  });

  await writeQueue;
}

export function parseCanonicalKeyOrThrow(canonical: string): { namespace: string; path: string } {
  const idx = canonical.indexOf(':');
  if (idx <= 0 || idx === canonical.length - 1) {
    throw new Error('Canonical key must be in the form "namespace:path".');
  }
  return { namespace: canonical.slice(0, idx), path: canonical.slice(idx + 1) };
}

function sanitizeIncomingValue(value: unknown): unknown {
  // Stage 3: no schema/types yet. We keep values JSON-safe and apply a conservative
  // rich-text sanitizer to strings that look like HTML.
  if (typeof value === 'string' && value.includes('<')) {
    return sanitizeRichText(value);
  }
  return value;
}

function assertValueSize(value: unknown) {
  try {
    const bytes = Buffer.byteLength(JSON.stringify(value), 'utf8');
    if (bytes > MAX_VALUE_BYTES) throw new Error('Value is too large.');
  } catch {
    throw new Error('Value must be JSON-serializable.');
  }
}

async function ensureCmsDir(): Promise<void> {
  const dir = path.dirname(CONTENT_PATH);
  await mkdir(dir, { recursive: true });
}

async function atomicWriteJson(filePath: string, doc: CmsDoc): Promise<void> {
  const tmp = `${filePath}.tmp`;
  await writeFile(tmp, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  await rename(tmp, filePath);
}

