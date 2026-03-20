# @devcms/core

Runtime package for **DevCMS**: hooks, inline components, sync, and server-only helpers for a developer-first inline CMS in **Next.js 15 (App Router)** and **React 19**.

---

## Installation

```bash
pnpm add @devcms/core
# or
npm install @devcms/core
# or
yarn add @devcms/core
```

**Peer dependencies:** `react@>=19`, `react-dom@>=19`.

---

## What’s in This Package

| Export | Use case |
|--------|----------|
| **`useCMS`** | Read/update content by path + namespace; TypeScript inference from fallback. |
| **`useCMSEditMode`** | Global edit mode flag + toggle (and **Ctrl/Cmd + Shift + E**). |
| **`InlineText`** | Inline plain-text field (contentEditable in edit mode). |
| **`InlineRichText`** | Inline rich-text field (sanitized HTML). |
| **`hydrateCMS`** | Fill the in-memory store from a snapshot (e.g. from `GET /api/cms`). |
| **`startCMSSync`** | Start polling or SSE sync to keep the store updated. |
| **`initCMS`** | Optional: initialize store with a custom adapter. |
| **`@devcms/core/server`** | Server-only: `validateKey`, `canonicalKey`, `sanitizeRichText` (no React). |

---

## Quick Example

```tsx
"use client";

import { InlineText, InlineRichText, useCMSEditMode } from "@devcms/core";

export function Hero() {
  const { isEditing, toggleEditMode } = useCMSEditMode();

  return (
    <section>
      <button type="button" onClick={toggleEditMode}>
        {isEditing ? "Exit edit mode" : "Edit mode"}
      </button>
      <h1>
        <InlineText
          path="hero.title"
          namespace="marketing"
          fallback="Welcome"
        />
      </h1>
      <InlineRichText
        path="hero.body"
        namespace="marketing"
        fallback="<p>Edit this.</p>"
      />
    </section>
  );
}
```

---

## API Reference

### Hooks

#### `useCMS(path, fallback, options?)`

Returns `[value, setValue]`. Value is inferred from `fallback`.

- **`path`** (string) – Logical path, e.g. `"hero.title"`.
- **`fallback`** (T) – Default value and type for T.
- **`options`** (optional):
  - **`namespace`** (string) – e.g. `"marketing"`. Key becomes `namespace:path`.
  - **`type`** – `"text"` | `"rich-text"`. For `"rich-text"`, strings are sanitized on set.
  - **`description`** (string) – Optional description.

Example:

```ts
const [title, setTitle] = useCMS("hero.title", "Default title", {
  namespace: "marketing",
  type: "text",
});
```

#### `useCMSEditMode()`

Returns `{ isEditing, toggleEditMode }`.

- **`isEditing`** (boolean) – Whether edit mode is on.
- **`toggleEditMode`** – Function to toggle. Keyboard shortcut **Ctrl/Cmd + Shift + E** is registered automatically.

---

### Inline Components

#### `<InlineText path fallback namespace? />`

- **`path`** (string) – Path segment of the content key.
- **`fallback`** (string, optional) – Default text.
- **`namespace`** (string, optional) – Namespace. Key = `namespace:path`.

Renders plain text; in edit mode becomes a contentEditable span.

#### `<InlineRichText path fallback namespace? />`

Same props as `InlineText`. Renders sanitized HTML; in edit mode allows editing with sanitization on save.

---

### Store and Sync

#### `hydrateCMS(snapshot)`

Fills the in-memory store with a record of key–value pairs (e.g. from `GET /api/cms`). Call after fetching the full content.

```ts
const res = await fetch("/api/cms");
const data = await res.json();
hydrateCMS(data);
```

#### `startCMSSync(options?)`

Starts background sync (polling or SSE). Returns a **stop** function.

- **`baseUrl`** (string, default `"/api/cms"`) – Base URL for GET and (for SSE) stream.
- **`mode`** – `"polling"` (default) or `"sse"`.
- **`intervalMs`** (number) – Polling interval in ms (for polling mode).
- **`fetcher`** (optional) – Custom `fetch` (e.g. for tests).
- **`eventSource`** (optional) – Custom `EventSource` (e.g. for tests or polyfills).

Example:

```ts
const stop = startCMSSync({
  baseUrl: "/api/cms",
  mode: "polling",
  intervalMs: 10_000,
});
// later: stop();
```

---

### Server-Only Entry: `@devcms/core/server`

Use in API routes, getServerSideProps, or Node/Edge so React hooks are not pulled into the server bundle.

```ts
import {
  validateKey,
  canonicalKey,
  sanitizeRichText,
} from "@devcms/core/server";
```

- **`canonicalKey(path, opts?)`** – Returns `namespace:path` or `null` if invalid. Options: `namespace`, `maxLength`.
- **`validateKey(path, opts?)`** – Returns `{ ok, namespace, path, canonicalKey }` or `{ ok: false, code, message }`.
- **`sanitizeRichText(html)`** – Returns sanitized HTML (safe tags/attributes). Use before persisting rich text.

---

## Docs

- **Use in your app:** [How to consume DevCMS](../../docs/CONSUMING.md)
- **API contract (GET/PATCH, sync):** [How to use the API](../../docs/API.md)
- **PostgreSQL:** [How to add PostgreSQL](../../docs/POSTGRES.md)
