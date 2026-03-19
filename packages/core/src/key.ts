import { isDev } from './internal/env';

export type CanonicalKey = `${string}:${string}`;

export type KeyIssueCode =
  | 'EMPTY_PATH'
  | 'EMPTY_NAMESPACE'
  | 'TOO_LONG'
  | 'INVALID_NAMESPACE'
  | 'INVALID_PATH';

export type KeyValidationResult =
  | { ok: true; namespace: string; path: string; canonicalKey: CanonicalKey }
  | { ok: false; code: KeyIssueCode; message: string };

const MAX_KEY_LENGTH = 200;
const NAMESPACE_RE = /^[a-zA-Z0-9_-]+$/;
const PATH_RE =
  /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*(\[(\d+|"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\])*(\.[a-zA-Z0-9_-]+(\[(\d+|"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\])*)*$/;

function normalizeNamespace(namespace: string | undefined): string {
  return (namespace ?? 'default').trim();
}

function normalizePath(path: string): string {
  return path.trim();
}

/**
 * Returns a canonical CMS storage key.
 *
 * - **Namespaces compose into keys**: `${namespace}:${path}`
 * - **Validation is fail-safe**: invalid keys never throw; they return `null` and
 *   log a clear error in development.
 */
export function canonicalKey(
  path: string,
  opts?: { namespace?: string; maxLength?: number },
): CanonicalKey | null {
  const result = validateKey(path, opts);
  if (!result.ok) {
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.error(`[DevCMS] Invalid CMS key: ${result.code}. ${result.message}`);
    }
    return null;
  }
  return result.canonicalKey;
}

export function validateKey(
  path: string,
  opts?: { namespace?: string; maxLength?: number },
): KeyValidationResult {
  const namespace = normalizeNamespace(opts?.namespace);
  const normalizedPath = normalizePath(path);
  const maxLen = opts?.maxLength ?? MAX_KEY_LENGTH;

  if (normalizedPath.length === 0) {
    return { ok: false, code: 'EMPTY_PATH', message: 'Path must be a non-empty string.' };
  }
  if (namespace.length === 0) {
    return { ok: false, code: 'EMPTY_NAMESPACE', message: 'Namespace must be non-empty.' };
  }
  if (!NAMESPACE_RE.test(namespace)) {
    return {
      ok: false,
      code: 'INVALID_NAMESPACE',
      message: `Namespace "${namespace}" contains illegal characters.`,
    };
  }
  if (!PATH_RE.test(normalizedPath)) {
    return {
      ok: false,
      code: 'INVALID_PATH',
      message:
        'Path must use dot notation (a.b.c) and optional bracket access (arr[0].title).',
    };
  }

  const key = `${namespace}:${normalizedPath}` as const;
  if (key.length > maxLen) {
    return {
      ok: false,
      code: 'TOO_LONG',
      message: `Key is too long (${key.length} > ${maxLen}).`,
    };
  }

  return { ok: true, namespace, path: normalizedPath, canonicalKey: key };
}

