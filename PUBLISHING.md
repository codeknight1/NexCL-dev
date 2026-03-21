# How to Publish DevCMS to npm

This guide describes the **exact steps and order** to publish DevCMS packages to npm. It is for **maintainers** of the DevCMS repo.

---

## Prerequisites

1. **npm account** – Create one at [npmjs.com](https://www.npmjs.com/signup) if needed.
2. **Logged in on your machine** – Run:
   ```bash
   npm login
   ```
   Enter your username, password, and (if enabled) one-time password.
3. **Scope** – Packages are published under the scope `@devcms`. Ensure the scope is yours (e.g. create an npm org `devcms` if you want `@devcms/core`, etc.).

---

## Packages You Can Publish

| Package | Directory | npm name |
|---------|-----------|----------|
| Core runtime | `packages/core` | `@devcms/core` |
| Types | `packages/types` | `@devcms/types` |
| CLI | `packages/cli` | `@devcms/cli` |
| Admin | `packages/admin` | `@devcms/admin` |
| ESLint config | `packages/eslint-config` | `@devcms/eslint-config` |
| TSConfig base | `packages/tsconfig` | `@devcms/tsconfig` |

The **demo app** (`apps/demo`) is **private** and must **not** be published.

**Inter-package dependency:** `@devcms/core` depends on `@devcms/types` with **`workspace:*`** in the repo so local `pnpm install` always links the workspace (and mirrors do not need `@devcms/types` on npm yet). When you run **`pnpm publish`**, pnpm **rewrites** `workspace:*` to the published semver in the tarball sent to npm.

**Publish order:** publish **`@devcms/types` before `@devcms/core`**. Prefer **`pnpm publish`** (not plain `npm publish` from a package folder without rewriting).

**Do not use `^0.1.0` for `@devcms/types` in `packages/core` unless that version already exists on your registry** — otherwise installs from a mirror (e.g. npmmirror) can 404 before first publish.

---

## Step-by-Step Release Process

### Step 1: Decide the Version

- Choose a **version number** (e.g. `0.1.0` for the first release, or bump patch/minor/major).
- For a **single-version** release, use the same version for all publishable packages (e.g. all `0.1.0`).

### Step 2: Update Versions in package.json

In each package you intend to publish, set the `version` field in `package.json`:

- `packages/core/package.json` → `"version": "0.1.0"`
- `packages/types/package.json` → `"version": "0.1.0"`
- `packages/cli/package.json` → `"version": "0.1.0"`
- (and so on for `admin`, `eslint-config`, `tsconfig`).

Ensure **`"private"`** is **`false`** (or absent) for publishable packages, and **`true`** for the demo app and the root workspace.

### Step 3: Install and Build

From the **repository root**:

```bash
pnpm install
pnpm -r build
```

This builds every package (and the demo app). Publishing only needs the **packages** to be built; the built output is in each package’s `dist/` (or equivalent). Fix any build or test failures before publishing.

### Step 4: Publish Each Package

Publish **one package at a time** from the repo root. Use `--access public` for scoped packages so they are visible on npm.

**Option A – Publish from root with filter (recommended)**

```bash
# Types first (dependency of @devcms/core)
pnpm --filter @devcms/types publish --access public

# Core (used by most consumers)
pnpm --filter @devcms/core publish --access public

# CLI
pnpm --filter @devcms/cli publish --access public

# Admin
pnpm --filter @devcms/admin publish --access public

# ESLint config (optional for consumers)
pnpm --filter @devcms/eslint-config publish --access public

# TSConfig (optional for consumers)
pnpm --filter @devcms/tsconfig publish --access public
```

**Option B – Publish from inside each package**

```bash
cd packages/core
npm publish --access public
cd ../types
npm publish --access public
cd ../cli
npm publish --access public
# ... repeat for admin, eslint-config, tsconfig
cd ../..
```

**Important:**

- **First publish:** Use `--access public` for each scoped package.
- **Re-publishing:** You must **bump the version** in `package.json` (e.g. to `0.1.1`) because npm does not allow overwriting an existing version.

### Step 5: Tag the Release in Git (Recommended)

After a successful publish:

```bash
git add packages/*/package.json
git commit -m "chore(release): v0.1.0"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

Adjust the branch name (`main`/`master`) and tag format if your project uses something different.

---

## Order of Publishing (Dependencies)

If packages depend on each other (e.g. `@devcms/core` depends on `@devcms/types`), publish **dependencies first**:

1. `@devcms/types`
2. `@devcms/core`
3. `@devcms/cli`
4. `@devcms/admin`
5. `@devcms/eslint-config`
6. `@devcms/tsconfig`

So in one go (from repo root):

```bash
pnpm --filter @devcms/types publish --access public
pnpm --filter @devcms/core publish --access public
pnpm --filter @devcms/cli publish --access public
pnpm --filter @devcms/admin publish --access public
pnpm --filter @devcms/eslint-config publish --access public
pnpm --filter @devcms/tsconfig publish --access public
```

---

## Version Bump for a Patch Release

1. Update **version** in each `package.json` (e.g. `0.1.0` → `0.1.1`).
2. Run **`pnpm install`** (so the lockfile and workspace refs stay consistent).
3. Run **`pnpm -r build`**.
4. Publish each package again (same commands as above).
5. Commit and tag (e.g. `v0.1.1`).

---

## Checklist Before Publishing

- [ ] All tests pass: `pnpm -r test`
- [ ] All packages build: `pnpm -r build`
- [ ] Version numbers set in every publishable package.
- [ ] No `"private": true` on packages you intend to publish.
- [ ] `npm whoami` shows the correct user/org.
- [ ] You have not already published the same version (bump if re-publishing).

---

## After Publishing: How Others Consume

Once published, consumers install from npm:

```bash
pnpm add @devcms/core @devcms/types
# or
npm install @devcms/core @devcms/types
```

They do **not** need this repo’s workspace setup. For usage, point them to the main [README](README.md) and the docs: [How to consume DevCMS](docs/CONSUMING.md), [API](docs/API.md), [PostgreSQL](docs/POSTGRES.md).
