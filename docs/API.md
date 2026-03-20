# How to Use the DevCMS API

This guide explains the **HTTP API** that DevCMS expects from your backend and how to **consume it** from your app or from scripts (e.g. curl, Postman, or another service).

---

## Overview

DevCMS uses a simple REST-style API:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **GET** | `/api/cms` | Return the full content map (all keys and values). |
| **PATCH** | `/api/cms/[key]` | Update a single content key. Body: `{ "value": <new value> }`. |
| **GET** | `/api/cms/stream` | (Optional) Server-Sent Events stream for live updates. |

Your Next.js app (or any backend) can implement these routes. The **demo app** in this repo already implements them with either **file storage** (`cms/content.json`) or **PostgreSQL** (when `DEVCMS_STORAGE=postgres`). This document focuses on **how to consume** the API from the frontend, scripts, or other services.

---

## 1. GET /api/cms – Fetch All Content

**Request:**

- **Method:** `GET`
- **URL:** `https://your-domain.com/api/cms` (or `http://localhost:3000/api/cms` in development)
- **Headers:** None required (optional: `Accept: application/json`)

**Response:**

- **Status:** `200 OK`
- **Body:** A single JSON object. Each key is a **canonical content key** (`namespace:path`). Each value is the stored content (string, number, boolean, or a JSON-serializable structure).

**Example:**

```http
GET /api/cms HTTP/1.1
Host: localhost:3000
```

```json
{
  "marketing:home.title": "Welcome to My Site",
  "marketing:home.intro": "<p>Edit this paragraph by turning on edit mode.</p>",
  "blog:post-1.title": "First Post"
}
```

**How the frontend uses it:**

- On load, your app calls `fetch('/api/cms')`, parses the JSON, and passes it to **`hydrateCMS(snapshot)`** so the in-memory store is filled.
- The **sync** layer can periodically call `GET /api/cms` again and call **`hydrateCMS(snapshot)`** to pick up changes made elsewhere (e.g. in the admin UI).

**Consuming from a script (curl):**

```bash
curl -s http://localhost:3000/api/cms
```

---

## 2. PATCH /api/cms/[key] – Update One Key

**Request:**

- **Method:** `PATCH`
- **URL:** `https://your-domain.com/api/cms/{canonicalKey}`  
  The **canonical key** must be **URL-encoded**. For example, `marketing:home.title` becomes `marketing%3Ahome.title`.
- **Headers:** `Content-Type: application/json`
- **Body:** A JSON object with a single property **`value`**. The value can be a string, number, boolean, or any JSON-serializable object (including HTML strings for rich-text fields).

**Example:**

```http
PATCH /api/cms/marketing%3Ahome.title HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"value": "New title from API"}
```

**Response:**

- **Success:** `200 OK` with optional body, e.g. `{ "ok": true }`.
- **Error:** `400 Bad Request` with a JSON body such as `{ "error": "Key length is invalid." }` or another message from your backend.

**Consuming from a script (curl):**

```bash
# Update a text field
curl -X PATCH http://localhost:3000/api/cms/marketing%3Ahome.title \
  -H "Content-Type: application/json" \
  -d '{"value": "Updated title"}'

# Update a rich-text field (HTML)
curl -X PATCH http://localhost:3000/api/cms/marketing%3Ahome.intro \
  -H "Content-Type: application/json" \
  -d '{"value": "<p>New <strong>intro</strong> text.</p>"}'
```

**How the frontend uses it:**

- When the user edits an inline field, the **core** updates the in-memory store and can call your PATCH endpoint to persist the change. The exact wiring depends on your app (e.g. the demo uses storage adapters that are called from the API routes; the client updates the store optimistically).

---

## 3. Canonical Key Format

Every content key in the API is a **canonical key**: `namespace:path`.

- **Namespace:** A group name (e.g. `marketing`, `blog`). No colons inside.
- **Path:** A path string (e.g. `home.title`, `post-1.body`). Colons are allowed in the path in principle, but the whole key is often kept simple (e.g. `marketing:home.title`).

**URL encoding:** When used in `PATCH /api/cms/[key]`, the key must be encoded. The colon `:` becomes `%3A`. Other characters (e.g. slashes, spaces) should also be encoded per standard URL encoding.

**Examples:**

| Canonical key           | Encoded in URL              |
|-------------------------|-----------------------------|
| `marketing:home.title`   | `marketing%3Ahome.title`    |
| `blog:post-1.body`      | `blog%3Apost-1.body`       |

---

## 4. Sync: Keeping the Frontend Updated

The DevCMS **sync** layer keeps the in-memory store in sync with the backend so that:

- Changes made in the **admin UI** appear on the frontend.
- Changes made in another tab or device (if using the same API) eventually appear.

**Polling (default):**

- The client periodically calls **GET /api/cms**, then calls **`hydrateCMS(snapshot)`** with the response.
- You start it with **`startCMSSync({ baseUrl: '/api/cms', mode: 'polling', intervalMs: 10000 })`** (or similar). Example is in **[How to consume DevCMS](CONSUMING.md)**.

**SSE (optional):**

- If your backend exposes **GET /api/cms/stream**, the client can use **Server-Sent Events** for live updates instead of (or in addition to) polling.
- You start it with **`startCMSSync({ baseUrl: '/api/cms', mode: 'sse' })`**.
- The stream sends JSON snapshots in the same shape as **GET /api/cms**. Each event is a full content snapshot; the client replaces the store with the latest snapshot (e.g. via `hydrateCMS`).
- If the browser doesn’t support `EventSource` or the stream fails, the core can fall back to polling.

---

## 5. GET /api/cms/stream – SSE Endpoint (Optional)

**Request:**

- **Method:** `GET`
- **URL:** `https://your-domain.com/api/cms/stream`

**Response:**

- **Content-Type:** `text/event-stream; charset=utf-8`
- **Body:** A stream of SSE events. Each event’s `data` is a JSON string of the **full content object** (same shape as **GET /api/cms**).

**Example event:**

```
data: {"marketing:home.title":"Welcome","marketing:home.intro":"<p>Intro</p>"}

```

The client parses each `data` line as JSON and updates the store (e.g. with `hydrateCMS(parsed)`). The demo app implements this in `app/api/cms/stream/route.ts` by periodically reading storage and sending a new event when the snapshot changes.

**Consuming from a script:** You can use a small Node script or a tool that supports SSE to connect to `/api/cms/stream` and log or process incoming events.

---

## 6. Error Handling

- **GET /api/cms:** On failure (e.g. 500), the client should handle the error (e.g. retry, show a message, or keep the previous snapshot).
- **PATCH /api/cms/[key]:** On 400, the response body usually contains `{ "error": "..." }`. Your backend may validate key format, value size, or sanitize rich text; error messages are up to your implementation.

---

## 7. Summary: Consumer Checklist

| Task | Action |
|------|--------|
| Load initial content | `GET /api/cms` → parse JSON → `hydrateCMS(snapshot)` |
| Update one key | `PATCH /api/cms/{encodedKey}` with body `{ "value": ... }` |
| Keep frontend in sync | Call `startCMSSync({ baseUrl: '/api/cms', mode: 'polling', intervalMs: 10000 })` (or `mode: 'sse'` if you have `/api/cms/stream`) |
| Canonical key in URL | Always URL-encode (e.g. `:` → `%3A`) |

For **implementing** these endpoints in your own Next.js app (file or Postgres), see the demo app’s `app/api/cms/` routes and **[How to add PostgreSQL](POSTGRES.md)**.
