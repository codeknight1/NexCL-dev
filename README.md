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

Windows PowerShell notes:

```powershell
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

## Postgres (Stage 4)

DevCMS can persist via Prisma + PostgreSQL behind the demo API routes.

- **Default**: file persistence to `cms/content.json`
- **Postgres**: set `DEVCMS_STORAGE=postgres` and provide `DATABASE_URL`

Example (PowerShell):

```powershell
$env:DEVCMS_STORAGE="postgres"
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/devcms?schema=public"
pnpm --filter demo prisma:generate
pnpm --filter demo prisma:migrate
pnpm dev --filter demo
```

Rollback guidance:

- Prefer `prisma migrate resolve` for marking migrations as rolled back/applied when needed.
- For local development, you can reset with `prisma migrate reset` (this drops data).

