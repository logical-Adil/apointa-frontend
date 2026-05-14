# Appointa — Frontend (Next.js)

This folder is the **browser app** for **Appointa**: marketing pages, sign-in and registration, and the signed-in **workspace** (chat, Socket.io updates, appointments, booking drawer). It is meant to run beside the **`backend/`** folder (same parent directory): Next.js proxies `/v1/*` and `/socket.io/*` to Express so session cookies stay on one origin. If you ship this as a **standalone frontend repo**, pair it with your API using env vars (see below).

> **Evaluator narrative** (architecture, tradeoffs, assumptions, limitations): **[SUBMISSION-PACK.md](./SUBMISSION-PACK.md)** in this folder.

---

## Source code (GitHub)

| Repo | URL |
|------|-----|
| **This frontend (Next.js)** | [github.com/logical-Adil/apointa-frontend](https://github.com/logical-Adil/apointa-frontend) |
| **Backend (Express + Prisma)** | [github.com/logical-Adil/appointa-backend](https://github.com/logical-Adil/appointa-backend) |

Clone this app:

```bash
git clone https://github.com/logical-Adil/apointa-frontend.git
cd apointa-frontend
```

---

## Full-stack layout (when `client/` and `backend/` sit together)

| Directory | Role | Stack |
|-----------|------|--------|
| **`client/`** (here) | Next.js UI | `npm` |
| **`backend/`** | Express API + Prisma + PostgreSQL + Socket.io + optional Mistral | `pnpm` |

You can use **two GitHub repos** ([frontend](https://github.com/logical-Adil/apointa-frontend), [backend](https://github.com/logical-Adil/appointa-backend)) or **one archive** with both folders. **There is no README at the repository root** — documentation lives in **`client/README.md`** and **`backend/README.md`** only.

---

## For evaluators — how to review

1. Read this file for the UI stack, local run, and smoke path.
2. Open **[SUBMISSION-PACK.md](./SUBMISSION-PACK.md)** for rubric-style architecture, tradeoffs, assumptions, and limitations.
3. Open **[`../backend/README.md`](../backend/README.md)** for the API, database, AI, and **[`../backend/endpoint.md`](../backend/endpoint.md)** for every REST route and payload.
4. Run both apps using **End-to-end local run** below, then trace code from **Where to look first**.

---

## Product behaviour (what “done” looks like)

| Surface | Purpose |
|---------|---------|
| **`/`** | Marketing landing; links into auth. |
| **`/login`**, **`/register`** | Account flows; errors map from API validation. |
| **`/app`** | Workspace: chat + appointments + booking UI. |

- **Anonymous:** landing + auth; session uses an **httpOnly** cookie from the API (not `localStorage` for the session).
- **Authenticated:** chat sessions and messages, realtime updates, appointment list.
- **Booking:** assistant (or fallback without `MISTRAL_API_KEY`) helps extract details; the drawer collects **appointment type** and optional **calendar title** (API fields `service` and `title`) plus time and duration.
- **Persistence:** data lives in PostgreSQL behind the API; schema is Prisma migrations in `backend/`.

Stack: **Next.js 16**, **React 19**, **Tailwind CSS 4**, **TanStack Query**, **Socket.io client**, **Geist** fonts.

---

## Prerequisites

| Tool | Notes |
|------|--------|
| **Node.js** | 18+ |
| **npm** | This package |
| **pnpm** | Sibling `backend/` (see backend README) |
| **PostgreSQL** | Required for the API (`backend/.env.example`) |

---

## End-to-end local run

From the **parent directory** that contains both `client/` and `backend/` (there is no README at that level — only these two folders matter).

**Terminal A — API**

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, FRONTEND_URL=http://localhost:3000 (optional MISTRAL_API_KEY)
pnpm install
pnpm prisma:migrate:deploy
pnpm prisma:generate
pnpm dev
```

API default: **`http://localhost:5000`**.

**Terminal B — this app**

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Open **`http://localhost:3000`**. The browser calls **`/v1/*`** on `:3000` only; Next rewrites to the backend so cookies work on localhost.

**Smoke checklist**

1. Register → land in workspace.
2. Send a chat message → appears (fallback assistant if no Mistral key — see backend README).
3. Create or confirm an appointment → listed and survives refresh.

---

## Local setup — frontend only

From **this folder** (`client/`):

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env.local
```

| Mode | Configuration |
|------|----------------|
| **Default (local dev)** | Leave `NEXT_PUBLIC_API_URL` unset. Rewrites send `/v1/*` and `/socket.io/*` to `BACKEND_ORIGIN` (default `http://localhost:5000`). |
| **Direct API host** | Set `NEXT_PUBLIC_API_URL` and, if needed, `NEXT_PUBLIC_SOCKET_URL`; understand CORS and cookies — see `.env.example`. |

### Dev server

```bash
npm run dev
```

Start **`../backend`** first so rewrites succeed.

---

## Architecture (full stack)

```
Browser (Next.js :3000)
    │  same-origin /v1/*  +  /socket.io/*  (next.config.ts rewrites)
    ▼
Express (:5000) + Socket.io
    ├── PostgreSQL (Prisma)
    └── Optional Mistral API
```

**Why same-origin proxy:** the API sets an **httpOnly** session cookie. Calling `:5000` directly from a page on `:3000` often breaks cookies on localhost; rewriting through Next avoids that.

---

## Security and configuration

- **`credentials: "include"`** on API calls — see **`src/lib/api/README.md`**.
- **`FRONTEND_URL`** on the server must match the browser origin that receives cookies (scheme + host + port).
- **`MISTRAL_API_KEY`** is optional; the product should still run for reviewers without it.

---

## Useful scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Webpack) |
| `npm run dev:turbo` | Dev with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## Folder map

```
src/
├── app/                    # App Router
│   ├── login/              # Sign-in
│   ├── register/           # Sign-up
│   └── app/                # Workspace
├── components/
│   ├── app/                # Workspace UI
│   ├── auth/               # Auth shell, fields
│   ├── site/               # Navbar, footer
│   └── ui/
├── features/               # React Query (auth, chat, appointments)
├── lib/
└── providers/
```

---

## Where to look first

| Task | Start here |
|------|------------|
| Workspace | `src/app/app/page.tsx` → `src/app/app/app-workspace.tsx` |
| Booking drawer | `src/components/app/booking-drawer.tsx` |
| Appointments list | `src/components/app/appointments-panel.tsx` |
| Auth forms | `src/app/login/login-form.tsx`, `src/app/register/register-form.tsx` |
| HTTP client | `src/lib/api/client.ts`, **`src/lib/api/README.md`** |
| Feature pattern | **`src/features/README.md`** |

**Server-side code** (routes, Prisma, Mistral): **`../backend/src/`**, **`../backend/prisma/`**.

---

## API and realtime

- **REST catalogue:** **[`../backend/endpoint.md`](../backend/endpoint.md)** — all `/v1` routes, bodies, responses.
- **`src/lib/api/client.ts`** — timeout, cookies, `ApiError`.
- **Socket.io** — same-origin `/socket.io` by default (rewritten).

Use **`src/features/*`** hooks, not raw `fetch`, for domain calls.

---

## Pairing with the backend

| Document | Role |
|----------|------|
| **[`../backend/README.md`](../backend/README.md)** | DB, env, `pnpm dev`, AI, production |
| **[`../backend/endpoint.md`](../backend/endpoint.md)** | HTTP reference |

If this repo is **frontend-only**, use your submission’s backend URL and env vars instead of `../backend`.

---

## Building for production

```bash
npm run build
```

Configure hosting so `NEXT_PUBLIC_*` and rewrites (or direct API URLs) match your deployment.

---

## Documentation map (this monorepo)

| File | Audience |
|------|----------|
| **GitHub** | [Frontend](https://github.com/logical-Adil/apointa-frontend) · [Backend](https://github.com/logical-Adil/appointa-backend) |
| **`client/README.md`** (this file) | Frontend + full-stack smoke path |
| **`backend/README.md`** | API, DB, scripts |
| **`backend/endpoint.md`** | REST reference |
| **`client/SUBMISSION-PACK.md`** / **`backend/SUBMISSION-PACK.md`** | Evaluator narrative (same content either place) |
| **`client/src/lib/api/README.md`**, **`client/src/features/README.md`** | Contributor conventions |

---

## Licence and contact

See **`package.json`**. Add reviewer contact in **`SUBMISSION-PACK.md`** when you submit.
