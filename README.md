# DevCMS

DevCMS is a clean, modern, developer-first **inline CMS** optimized for **Next.js 15 (App Router)** + **React 19**.

This repository is a **pnpm workspaces** + **Turborepo** monorepo.

## Getting started in 60 seconds

Prereqs: Node.js 20+ recommended, `pnpm` installed.

```bash
pnpm -v
pnpm install
pnpm -r build
pnpm -r test
```

## Repo layout

- `apps/demo`: Next.js demo app (Stage 2 will wire inline editing)
- `packages/core`: DevCMS runtime (Stage 1)
- `packages/types`: shared public types
- `packages/cli`: schema extraction tooling (later stages)
- `packages/admin`: admin UI package (later stages)
- `packages/eslint-config`: shared ESLint config
- `packages/tsconfig`: shared TypeScript configs

## Scripts

- `pnpm dev`: run development tasks (where applicable)
- `pnpm build`: build all workspaces
- `pnpm test`: run all tests
- `pnpm lint`: lint all workspaces

