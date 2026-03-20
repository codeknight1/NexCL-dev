# How to Add Your PostgreSQL Database

This guide walks you through using **PostgreSQL** (with Prisma) as the storage backend for DevCMS instead of the default file-based storage (`cms/content.json`). It is written step-by-step for beginners.

---

## What You Need

- A **PostgreSQL** database (local, Docker, or a hosted service like Neon, Supabase, or Railway).
- Your DevCMS app set up with the **demo** (or your own Next.js app that uses the same API and storage pattern).
- **Prisma** already in the project (the demo app includes it).

---

## Step 1: Install PostgreSQL (If You Don’t Have It)

**Option A – Local install**

- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
- Remember the password you set for the default user (often `postgres`).

**Option B – Docker**

```bash
docker run --name devcms-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Default user: `postgres`, password: `postgres`, port: `5432`.

**Option C – Hosted (e.g. Neon, Supabase)**

- Create a project and copy the **connection string** (e.g. `postgresql://user:password@host:5432/dbname?sslmode=require`).

---

## Step 2: Create a Database

If you installed PostgreSQL locally or with Docker, create a dedicated database:

**Using `psql` (command-line):**

```bash
psql -U postgres -h localhost
```

Then in the prompt:

```sql
CREATE DATABASE devcms;
\q
```

**Using a GUI (e.g. pgAdmin, DBeaver):** Create a new database named `devcms` (or any name you like).

For **hosted** providers, the project usually comes with a database; use the database name from the connection string.

---

## Step 3: Set the Connection URL

Your app needs a **connection string** so Prisma can connect to PostgreSQL.

**Format:**

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

**Example (local, default user):**

```text
postgresql://postgres:postgres@localhost:5432/devcms?schema=public
```

**Example (Neon / hosted, with SSL):**

```text
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Where to put it:**

1. **Environment variable:** `DATABASE_URL`
2. In development, create a `.env` file in the **root of your app** (e.g. `apps/demo/.env` in the monorepo, or project root in a single app). Do **not** commit real passwords to git.

**Example `.env` (in `apps/demo/` or your app root):**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devcms?schema=public"
```

If you use the monorepo demo, run commands from the repo root and ensure the `.env` is in `apps/demo/` (Next.js and Prisma load it from the app directory).

---

## Step 4: Point DevCMS to Postgres

DevCMS chooses the storage backend via an **environment variable**.

Set:

```env
DEVCMS_STORAGE=postgres
```

So your `.env` (e.g. in `apps/demo/`) might look like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devcms?schema=public"
DEVCMS_STORAGE=postgres
```

- If `DEVCMS_STORAGE` is **not** set or is anything other than `postgres`, DevCMS uses **file storage** (`cms/content.json`).
- When `DEVCMS_STORAGE=postgres`, the app will use the Prisma adapter and the `CmsEntry` table.

---

## Step 5: Prisma Schema (Already in the Demo)

The demo app already includes a Prisma schema for the CMS table. It should look like this (path: `apps/demo/prisma/schema.prisma` or your app’s `prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model CmsEntry {
  id         String   @id @default(cuid())
  key        String   // canonical key base, e.g. "marketing:home.title"
  namespace  String
  path       String
  locale     String?
  value      Json
  version    Int      @default(1)
  updatedAt  DateTime @updatedAt
  createdAt  DateTime @default(now())

  @@unique([key, locale])
  @@index([namespace])
  @@index([path])
  @@index([updatedAt])
}
```

You don’t need to change this unless you want to extend the model. The important part is **datasource db** using `env("DATABASE_URL")`.

---

## Step 6: Generate the Prisma Client

From the **app directory** that contains `prisma/schema.prisma` (e.g. `apps/demo` in the monorepo):

```bash
cd apps/demo
pnpm prisma generate
# or: npx prisma generate
```

Or from the **repo root** with a filter:

```bash
pnpm --filter demo exec prisma generate
```

This generates the Prisma Client so your code can talk to the database. You should run this after any change to `schema.prisma`.

---

## Step 7: Run Migrations (Create the Table)

Apply the schema to your database so the `CmsEntry` table exists:

```bash
cd apps/demo
pnpm prisma migrate dev --name init_cms
# or: npx prisma migrate dev --name init_cms
```

Or from repo root:

```bash
pnpm --filter demo exec prisma migrate dev --name init_cms
```

- The first time, this creates a `migrations` folder and the `CmsEntry` table.
- Use a meaningful name instead of `init_cms` if you prefer (e.g. `add_cms_entry`).

If you use a **hosted** database, run the same command; Prisma will apply migrations to the database pointed to by `DATABASE_URL`.

---

## Step 8: Start the App and Verify

1. Ensure **`.env`** has:
   - `DATABASE_URL=...`
   - `DEVCMS_STORAGE=postgres`

2. Start the app:

```bash
pnpm --filter demo dev
# or from apps/demo: pnpm dev
```

3. Open the app (e.g. `http://localhost:3000`), enter edit mode, and change some content. Then:
   - Open **Admin** (`/admin/cms`) and confirm entries appear, or
   - Check the database: in `psql` or a GUI, run `SELECT * FROM "CmsEntry";` (or the table name Prisma uses; it may be `CmsEntry` or `cms_entry` depending on your Prisma version/settings).

If you see rows in `CmsEntry` and the admin/frontend show the same data, Postgres is wired correctly.

---

## Step 9: Switching Back to File Storage

To stop using Postgres and use the file again:

1. Remove or comment out `DEVCMS_STORAGE=postgres` in `.env`, or set:
   ```env
   DEVCMS_STORAGE=file
   ```
   (The demo treats any non-`postgres` value as file storage.)

2. Restart the app. Content will then be read/written to `cms/content.json` (in the demo, the path is relative to the app; see `lib/cmsFileStore.ts`).

Existing data in PostgreSQL is not deleted; you’re just switching the backend.

---

## Troubleshooting

| Problem | What to check |
|--------|----------------|
| **"Prisma Client did not initialize"** | Run `prisma generate` from the app directory (where `prisma/schema.prisma` lives). |
| **"Can't reach database server"** | Is PostgreSQL running? Is `DATABASE_URL` correct (host, port, user, password, database name)? For hosted DBs, is SSL required (`?sslmode=require`)? |
| **"Relation CmsEntry does not exist"** | Run `prisma migrate dev` so the table is created. |
| **Admin or API still show file data** | Ensure `DEVCMS_STORAGE=postgres` is set and the app was restarted. Clear browser cache if needed. |
| **Migrations fail on hosted DB** | Some hosts require SSL. Add `?sslmode=require` to `DATABASE_URL`. Check that the user has permission to create tables. |

---

## Summary Checklist

- [ ] PostgreSQL installed (local, Docker, or hosted).
- [ ] Database created and `DATABASE_URL` set in `.env`.
- [ ] `DEVCMS_STORAGE=postgres` set in `.env`.
- [ ] `prisma generate` run from the app directory.
- [ ] `prisma migrate dev` run to create `CmsEntry`.
- [ ] App started and content edited; verify data in DB and in the UI.

For **API usage** (GET/PATCH), see **[How to use the API](API.md)**. For **using DevCMS in your app**, see **[How to consume DevCMS](CONSUMING.md)**.
