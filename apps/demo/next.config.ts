import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Avoid wrong workspace root when multiple lockfiles exist (e.g. user home + monorepo). */
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
