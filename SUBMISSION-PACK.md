# Appointa — Submission pack (evaluator-facing)

Use this document when you submit the project for grading or review. It complements **[`README.md`](./README.md)** in this folder (frontend) and **[`../backend/README.md`](../backend/README.md)** (API). **There is no README at the repository root** — documentation lives only under `client/` and `backend/`. Public GitHub: [frontend](https://github.com/logical-Adil/apointa-frontend), [backend](https://github.com/logical-Adil/appointa-backend). Fill in anything inside `[square brackets]` below for demo / video / contact when you publish those.

---

## Quick links

| What | Link |
|------|------|
| **Monorepo or combined archive** | Point reviewers to **`client/README.md`** and **`backend/README.md`**. No root `README.md`. |
| **Frontend (Next.js)** | [https://github.com/logical-Adil/apointa-frontend](https://github.com/logical-Adil/apointa-frontend) |
| **Backend (Express + Prisma)** | [https://github.com/logical-Adil/appointa-backend](https://github.com/logical-Adil/appointa-backend) |
| Live demo (optional but helpful) | `[YOUR_LIVE_DEMO_URL_OR_WRITE_NOT_DEPLOYED]` |
| Short demo video (optional) | `[YOUR_VIDEO_LINK_OR_LEAVE_BLANK]` |

Some submissions ship **one folder** containing `client/` and `backend/`; others split into **two GitHub repositories**. Both layouts are valid — use **`client/README.md`** and **`backend/README.md`** together when both folders exist; each file also stands alone if you split repos.

---

## What you are looking at

**Appointa** is a web application where a signed-in user chats with an assistant to book appointments. The assistant interprets natural language when possible, extracts dates and times, and the user can finish or correct details in a **booking form** when fields are missing or ambiguous. Appointments are stored in **PostgreSQL** and listed beside the conversation. New chat messages can appear in **real time** via a persistent connection (Socket.io) alongside the same Express server that serves REST.

---

## How to run it on your machine

**Fast path:** open **`client/README.md`** and **`backend/README.md`** — each includes prerequisites, port defaults, and the same end-to-end smoke checklist (run backend first, then client).

**Summary:**

1. **Backend** — In the backend package directory: Node + **pnpm**, PostgreSQL, copy **`.env.example`** → **`.env`**, set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (e.g. `http://localhost:3000`), optional `MISTRAL_API_KEY`. Run `pnpm install`, `pnpm prisma:migrate:deploy`, `pnpm dev` (default API **`http://localhost:5000`**).
2. **Frontend** — In the client package directory: Node + **npm**, copy **`.env.example`** → **`.env.local`**, run `npm install`, `npm run dev`, open **`http://localhost:3000`**. By default Next.js **proxies** `/v1/*` and `/socket.io/*` to the backend so session cookies stay on one browser origin.

### Try the flow

1. Create an account and sign in.
2. Open the workspace, send chat messages, use **New appointment** or the flow suggested from chat.
3. Confirm appointments appear in the list and survive refresh.

If any command differs slightly in your checkout, the **`README.md`** in `backend/` and `client/` is authoritative for scripts.

---

## Architecture (simple picture)

```
Browser (Next.js)
    |
    |  Same-origin /v1/* and /socket.io/* (rewritten to Express in dev)
    v
Server (Express)
    |
    +-- PostgreSQL (users, sessions, messages, appointments, tokens)
    |
    +-- Optional: Mistral API (booking extraction from chat)
    |
    +-- Live chat updates (Socket.io on the same server)
```

**Why same-origin proxy in development:** the API sets an **httpOnly** cookie; having the SPA on `localhost:3000` call `localhost:5000` directly often prevents the cookie from being sent. Next.js rewrites keep a single origin for the browser.

**What runs where:**

- **Browser:** pages, forms, chat UI, Socket.io client, TanStack Query cache.
- **Server:** authentication, persistence, AI call when configured, realtime emits.

---

## Main design choices (tradeoffs)

| Choice | Why | Tradeoff |
|--------|-----|----------|
| Optional split into two Git repos | Clear deploy boundaries for teams that host frontend and API separately | Reviewers may need two clones unless you ship one combined archive |
| Signed tokens + httpOnly cookie session | Server trusts requests without storing every session in memory | Production needs HTTPS and correct `SameSite` / domain alignment |
| Socket.io for chat | Low-latency updates without polling | Slightly more moving parts than REST-only |
| AI optional with fallback | Demo runs without reviewer API keys | Without keys, assistant behaviour is intentionally simpler |
| Booking form when chat is incomplete | Users are never stuck when the model omits a field | Two input paths (chat + form) instead of chat-only |
| PostgreSQL + Prisma migrations | Auditable schema history | Raw DDL for assessors lives under **`prisma/migrations/`** in the backend package |

---

## Assumptions (things we treated as given)

- Each user sees only their own chats and appointments (no multi-tenant “organisation” layer in this prototype).
- Time zones follow server and browser defaults unless configured elsewhere.
- “Real-time” means the server pushes when possible; very poor networks may still feel delayed.
- The AI assists with scheduling language, not regulated professional advice; content is user-generated.
- Email verification and full production hardening are out of scope unless explicitly added.

---

## Known limitations (honest list)

- Not load-tested for large concurrent audiences.
- AI quality and availability depend on provider, keys, and model id; failures degrade gracefully but responses may be generic.
- Each assistant reply also appends a row to **`ai_invocations`** (latency, optional token counts from Mistral, `ok` / `error` / `disabled`) for analytics; Winston still logs operational detail to the console.
- Live demo and video links are optional — add them in the table at the top when available.

---

## Database (what exists vs sample SQL on paper)

**Conceptual tables:** users, chat sessions, chat messages, appointments, token rows for auth flows as implemented.

**Indexes:** foreign keys and time-sorted access paths are indexed in Prisma schema for list and chat queries.

**Canonical SQL:** in the backend package, **`prisma/schema.prisma`** and **`prisma/migrations/*/migration.sql`**. Point reviewers there or export DDL if a single `.sql` file is required.

---

## Optional multi-tenancy

Not implemented. A future `business_id` (or similar) on users and child rows would be the typical extension for multiple organisations.

---

## Contact / notes for the reviewer

`[OPTIONAL: YOUR_NAME, EMAIL, OR LINKEDIN]`

---

*Last updated: `[DATE]` when you submit.*
