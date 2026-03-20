/**
 * Server-only entry point: no React, no hooks.
 * Use this in API routes, getServerSideProps, and other Node/Edge runtimes
 * so that the main bundle is not pulled into server code.
 */
export { validateKey, canonicalKey } from './key';
export type { CanonicalKey, KeyValidationResult, KeyIssueCode } from './key';
export { sanitizeRichText } from './sanitize';
