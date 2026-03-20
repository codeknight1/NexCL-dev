# How to Consume DevCMS (Step-by-Step)

This guide is for **complete beginners**. You will learn how to install DevCMS in your own Next.js 15 app and get inline editing working.

---

## What You Need Before Starting

- **Node.js 20 or newer**
- A **Next.js 15** project using the **App Router**
- **React 19**
- **TypeScript** (recommended)

If you don’t have a project yet, create one:

```bash
npx create-next-app@latest my-app --typescript --app --no-src-dir
cd my-app
```

---

## Step 1: Install the Packages

From your project root, install the core runtime and types:

**With pnpm:**

```bash
pnpm add @devcms/core @devcms/types
```

**With npm:**

```bash
npm install @devcms/core @devcms/types
```

**With yarn:**

```bash
yarn add @devcms/core @devcms/types
```

These packages provide:

- `@devcms/core` – hooks (`useCMS`, `useCMSEditMode`), inline components (`InlineText`, `InlineRichText`), sync, and server helpers.
- `@devcms/types` – shared TypeScript types for content and schema.

**Peer dependencies:** Your app must already have `react@^19`, `react-dom@^19`, and (for Next.js) `next@^15`. The installer will warn if they’re missing.

---

## Step 2: Create Your First Editable Page

We’ll add a simple page with one editable title and one editable paragraph.

1. **Create a client component** (e.g. `app/HomePage.tsx`):

   In the App Router, any component that uses React hooks or event handlers must be a **Client Component**. Add `"use client";` at the top.

2. **Use the inline components:**

Create a file such as `components/HomePage.tsx`:

```tsx
"use client";

import { InlineText, InlineRichText } from "@devcms/core";

export function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
      <h1>
        <InlineText
          path="home.title"
          namespace="marketing"
          fallback="Welcome to My Site"
        />
      </h1>

      <div style={{ marginTop: "1rem" }}>
        <InlineRichText
          path="home.intro"
          namespace="marketing"
          fallback="<p>Edit this paragraph by turning on edit mode.</p>"
        />
      </div>
    </main>
  );
}
```

**What each prop means:**

- **`path`** – A logical path for this field, e.g. `"home.title"`. Together with `namespace` it forms the content key.
- **`namespace`** – A group name (e.g. `"marketing"`). The full key in the CMS will be `marketing:home.title`.
- **`fallback`** – The default value if the CMS has nothing stored yet. For `InlineRichText` use safe HTML (e.g. `<p>...</p>`).

3. **Render the component from a page:**

In `app/page.tsx` (or another route):

```tsx
import { HomePage } from "@/components/HomePage";

export default function Page() {
  return <HomePage />;
}
```

At this point, the page will **render** the fallback text, but you **cannot edit yet** because edit mode is off. Next we add the edit-mode toggle.

---

## Step 3: Add the Edit Mode Toggle

Edit mode is a global switch. When it’s **on**, inline fields become editable. When it’s **off**, they’re read-only.

1. **Create a small toolbar or header component** (must be a client component):

Example: `components/EditModeToggle.tsx`

```tsx
"use client";

import { useCMSEditMode } from "@devcms/core";

export function EditModeToggle() {
  const { isEditing, toggleEditMode } = useCMSEditMode();

  return (
    <button
      type="button"
      onClick={toggleEditMode}
      style={{
        padding: "0.5rem 1rem",
        background: isEditing ? "#333" : "#eee",
        color: isEditing ? "#fff" : "#000",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {isEditing ? "Exit edit mode" : "Enter edit mode"}
    </button>
  );
}
```

2. **Put the toggle in your layout** so it appears on every page:

In `app/layout.tsx`:

```tsx
import { EditModeToggle } from "@/components/EditModeToggle";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
          <EditModeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
```

3. **Try it:**

- Run your app (`pnpm dev` or `npm run dev`).
- Click **“Enter edit mode”**.
- Click inside the title or the paragraph and type. You should see the text change.

**Keyboard shortcut:** You can also press **Ctrl+Shift+E** (Windows/Linux) or **Cmd+Shift+E** (Mac) to toggle edit mode.

Changes are stored **in memory** in the browser until you connect a backend. The next step is to connect your app to the DevCMS API so content is saved and loaded from the server.

---

## Step 4: Connect to the DevCMS API

Your app needs to:

1. **Load** the full content map when the app (or a page) loads.
2. **Save** changes when a user edits a field.

DevCMS expects your backend to expose two endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **GET** | `/api/cms` | Return the entire content object `{ "namespace:path": value, ... }`. |
| **PATCH** | `/api/cms/[key]` | Update one key. Body: `{ "value": <new value> }`. The `[key]` is the full canonical key (e.g. `marketing%3Ahome.title` URL-encoded). |

You have two options:

- **Option A – Use the demo app as your backend:** Run the demo app (`apps/demo` in this repo), implement the same API in your own Next app, or point your frontend to the demo’s API (if CORS allows).
- **Option B – Implement the API in your own Next app:** Add `app/api/cms/route.ts` (GET) and `app/api/cms/[key]/route.ts` (PATCH) that read/write your storage (file or database). See **[How to use the API](API.md)** and **[How to add PostgreSQL](POSTGRES.md)** for details.

Once the API is available, you need to:

1. **Initialize the CMS store** with the data from `GET /api/cms`.
2. **Start the sync** so the store stays updated (e.g. when someone edits in the admin).

---

## Step 5: Load Initial Content and Start Sync

DevCMS uses an in-memory store that you **hydrate** from the API and keep in sync.

1. **Create a provider or layout component** that runs only on the client and:
   - Fetches `GET /api/cms`.
   - Calls `hydrateCMS(snapshot)` to fill the store.
   - Calls `startCMSSync()` so the store is updated periodically (or via SSE).

Example `components/CmsProvider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { hydrateCMS, startCMSSync } from "@devcms/core";

const API_BASE = "/api/cms"; // or your API base URL

export function CmsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1) Load initial snapshot
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => {
        hydrateCMS(data);
      })
      .catch(console.error);

    // 2) Start background sync (polling every 10s; or use mode: "sse" if you have /api/cms/stream)
    const stopSync = startCMSSync({
      baseUrl: API_BASE,
      mode: "polling",
      intervalMs: 10_000,
    });

    return () => stopSync();
  }, []);

  return <>{children}</>;
}
```

2. **Wrap your app with the provider** in the root layout:

```tsx
// app/layout.tsx
import { CmsProvider } from "@/components/CmsProvider";
import { EditModeToggle } from "@/components/EditModeToggle";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CmsProvider>
          <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
            <EditModeToggle />
          </header>
          {children}
        </CmsProvider>
      </body>
    </html>
  );
}
```

After this:

- The first time the app loads, it fetches the full content from `GET /api/cms` and fills the store.
- Inline edits update the store and should be sent to the backend by your PATCH implementation (see **[API](API.md)** for how the client/store and PATCH interact if you implement it yourself).
- Sync keeps the store updated when content changes elsewhere (e.g. admin).

---

## Step 6: Using the Hook Instead of Inline Components

If you prefer to build your own UI (inputs, textareas, etc.) instead of using `<InlineText>` / `<InlineRichText>`, you can use the **`useCMS`** hook.

```tsx
"use client";

import { useCMS } from "@devcms/core";

export function CustomTitleEditor() {
  const [title, setTitle] = useCMS("home.title", "Default title", {
    namespace: "marketing",
    type: "text",
  });

  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  );
}
```

- First argument: **path** (e.g. `"home.title"`).
- Second argument: **fallback** value (and type for TypeScript).
- Third argument: **options** – `namespace`, `type` (`"text"` or `"rich-text"`), and optional `description`.

For rich text you’d use `type: "rich-text"` and pass HTML strings; the core will sanitize on save when using the hook with that type.

---

## Step 7: Admin Dashboard (Optional)

If your backend serves the same API and you run a copy of the **demo app** (or embed its admin), you can open:

```
http://localhost:3000/admin/cms
```

There you get a table of all content keys, search, and the ability to edit values. Changes there will propagate to the frontend if sync is running (polling or SSE). To add the admin to your own app, you can copy the admin routes and components from `apps/demo` (see repo layout in the main [README](../README.md)).

---

## Summary Checklist

- [ ] Node 20+, Next.js 15 App Router, React 19.
- [ ] Install `@devcms/core` and `@devcms/types`.
- [ ] Add a client page with `<InlineText>` and/or `<InlineRichText>` (path, namespace, fallback).
- [ ] Add edit mode toggle with `useCMSEditMode()` and put it in the layout.
- [ ] Implement `GET /api/cms` and `PATCH /api/cms/[key]` (see [API](API.md)).
- [ ] In a client provider, fetch `GET /api/cms`, call `hydrateCMS(snapshot)`, and call `startCMSSync(...)`.
- [ ] Optionally add the admin UI and/or use `useCMS` for custom controls.

For **API details** (request/response format, sync, SSE): see **[How to use the API](API.md)**.  
For **PostgreSQL**: see **[How to add PostgreSQL](POSTGRES.md)**.
