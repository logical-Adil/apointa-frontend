# `features/` — feature modules

Each subfolder owns one slice of the product. The shape is identical
everywhere so it's predictable to navigate:

```
features/<name>/
  <name>.types.ts   # Request / response DTOs and any module-only types
  <name>.api.ts     # Pure fetch functions (no React) using `lib/api/client`
  <name>.hooks.ts   # React Query hooks — what components import
  index.ts          # Barrel: re-exports types and hooks; api as namespace
```

## Rules of thumb

- **UI never calls `fetch` directly.** Always go through a feature hook.
- **Hooks never call `fetch` directly either.** They call functions from
  `<name>.api.ts`, which keeps mutations testable in isolation.
- **Cross-feature invalidation is fine.** Reach for `queryKeys.<other>.all`
  inside a hook's `onSuccess` if mutating one feature changes another (e.g.
  sending a chat message can refresh the appointments list).
- **Keep request/response types here, not in `lib/app/types.ts`.** Domain
  types that the UI shares (Appointment, Message, …) still live in
  `lib/app/types.ts` and are re-exported from feature files.

## Current modules

- `auth` — login, register, current user, logout.
- `appointments` — list, detail, create, update status, delete.
- `chat` — sessions, messages, send message (with optimistic cache update).
