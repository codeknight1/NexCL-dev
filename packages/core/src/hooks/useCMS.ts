import { useMemo } from 'react';
import { useStore } from 'zustand';

import type { CanonicalKey } from '../key';
import { canonicalKey } from '../key';
import { sanitizeRichText } from '../sanitize';
import { getCMSStore } from '../store/instance';

export type CMSFieldType = 'text' | 'rich-text';

export interface UseCMSOptions {
  namespace?: string;
  type?: CMSFieldType;
  description?: string;
}

export type CMSSetter<T> = (next: T) => void;

/**
 * Read and optimistically update CMS content by key.
 *
 * The fallback value is the source of truth for initial structure and provides
 * TypeScript inference for the returned value and setter.
 */
export function useCMS<T>(
  path: string,
  fallback: T,
  options?: UseCMSOptions,
): readonly [T, CMSSetter<T>] {
  const key = useMemo(() => canonicalKey(path, { namespace: options?.namespace }), [path, options]);
  const store = getCMSStore();

  const value = useStore(
    store,
    (s) => (key ? (s.values[key] as T | undefined) : undefined) ?? fallback,
  );

  const setValue: CMSSetter<T> = (next) => {
    if (!key) return;
    const normalized = normalizeForType(next, options?.type);
    store.getState().setValue(key as CanonicalKey, normalized);
  };

  return [value, setValue] as const;
}

function normalizeForType<T>(value: T, type: CMSFieldType | undefined): T {
  if (type === 'rich-text' && typeof value === 'string') {
    return sanitizeRichText(value) as T;
  }
  return value;
}

