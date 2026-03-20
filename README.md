# DevCMS

DevCMS is a **developer-first inline CMS** for **Next.js 15 (App Router)** and **React 19**. Edit content directly on the page, store it in a JSON file or PostgreSQL, and keep everything type-safe and simple.

---

## What DevCMS Offers

| Feature | Description |
|--------|-------------|
| **Inline editing** | Edit text and rich text right on the page with `<InlineText>` and `<InlineRichText>`. |
| **Typed content** | Use the `useCMS` hook with TypeScript inference from your fallback values. |
| **Edit mode** | Global on/off switch (and keyboard shortcut **Ctrl/Cmd + Shift + E**) so only editors see editable fields. |
| **Storage** | File-based JSON by default; optional **PostgreSQL** via Prisma. |
| **Admin UI** | Built-in `/admin/cms` dashboard to list, search, and edit all content. |
| **Sync** | Polling or SSE so changes (e.g. from admin) propagate to the frontend. |
| **CLI** | `devcms extract` to scan your app and generate a content schema. |

---

## Quick Start (This Repo)

**Prerequisites:** Node.js 20+, pnpm (or npm).

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run the demo app
pnpm --filter demo dev
```

Open **http://localhost:3000**. Use the edit toggle or **Ctrl/Cmd + Shift + E** to enter edit mode and click any inline field to edit.

---

## Documentation (Step-by-Step)

All guides are written for **complete beginners**. Start with **Consuming** if you want to use DevCMS in your own app.

| Document | What it covers |
|----------|----------------|
| **[How to consume DevCMS](docs/CONSUMING.md)** | Install in your Next.js app, add inline fields, edit mode, and connect to the API. Step-by-step. |
| **[How to use the API](docs/API.md)** | GET/PATCH endpoints, request/response format, sync (polling + SSE), and how to call the API from your app or scripts. |
| **[How to add PostgreSQL](docs/POSTGRES.md)** | Set up Prisma, `DATABASE_URL`, run migrations, and switch from file storage to Postgres. |
| **[How to publish to npm](PUBLISHING.md)** | Versioning, building, and publishing `@devcms/core` and other packages to npm. For maintainers. |

---

## Repository Layout

| Path | Description |
|------|-------------|
| `apps/demo` | Next.js 15 demo app: inline editing, admin UI, file or Postgres storage. |
| `packages/core` | Runtime: hooks, inline components, sync, server-only helpers. Publish as `@devcms/core`. |
| `packages/types` | Shared TypeScript types. Publish as `@devcms/types`. |
| `packages/cli` | Schema extraction (`devcms extract`). Publish as `@devcms/cli`. |
| `packages/admin` | Admin UI package. Publish as `@devcms/admin`. |
| `packages/eslint-config` | Shared ESLint config. |
| `packages/tsconfig` | Shared TypeScript config. |

---

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies. |
| `pnpm -r build` | Build every package and the demo app. |
| `pnpm -r test` | Run tests in all workspaces. |
| `pnpm -r lint` | Lint all workspaces. |
| `pnpm --filter demo dev` | Start the demo app in development. |
| `pnpm --filter @devcms/core build` | Build only the core package. |

---

## License

MIT (or your chosen license).
