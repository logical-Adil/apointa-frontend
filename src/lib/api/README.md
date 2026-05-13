# `lib/api` — client-side API layer

Foundation shared by every feature module under `src/features/*`. Pages and
components should **not** call `fetch` directly; they import hooks from a
feature folder, which in turn uses this layer.

## Pieces

| File | Purpose |
| ---- | ------- |
| `client.ts` | `apiFetch<T>()` + `api.{get,post,put,patch,delete}` sugar. Sends cookies via `credentials: "include"` (the JWT lives in an httpOnly cookie that the backend sets — the client never reads tokens), JSON-encodes bodies, applies a 15s timeout, and throws `ApiError` on non-2xx. |
| `errors.ts` | `ApiError` class + `getErrorMessage()` / `getFieldErrors()` helpers. The single error shape every form maps from. |
| `query-client.ts` | `getQueryClient()` — SSR-safe singleton with sensible defaults (no retry on 4xx, no auto retry on mutations). |
| `query-keys.ts` | `queryKeys` factory. Use this when invalidating: `qc.invalidateQueries({ queryKey: queryKeys.appointments.all })`. |

## Auth model

- No JWT in `localStorage`. The backend sets `Set-Cookie: appointa_session=…; HttpOnly; Secure; SameSite=Lax` on login / register.
- The client decides "logged in or not" by calling `GET /v1/auth/me` (see `features/auth/useAuth`).
- All requests carry the cookie automatically thanks to `credentials: "include"`. The backend must respond with `Access-Control-Allow-Credentials: true` and an exact `Access-Control-Allow-Origin` (not `*`) for CORS.

## Adding a new feature module

```
features/<name>/
  <name>.types.ts   # request / response DTOs
  <name>.api.ts     # functions calling `api.*`
  <name>.hooks.ts   # `useQuery` / `useMutation` wrappers
  index.ts          # public surface — re-exports
```

## Form integration recipe

```tsx
const mutation = useLogin();

async function onSubmit(values) {
  setFormError(null);
  setFieldErrors({});

  try {
    await mutation.mutateAsync(values);
    router.replace("/app");
  } catch (error) {
    const fields = getFieldErrors(error);
    if (fields) setFieldErrors(fields);
    else setFormError(getErrorMessage(error));
  }
}
```

`mutation.isPending` drives the button's `disabled` + spinner — no extra
`submitting` state needed.

## Expected backend error shape

```json
{
  "code": "validation_error",
  "message": "Invalid request",
  "errors": { "email": "Email is already registered." }
}
```

`message` → banner. `errors` → field-level. Anything missing falls back to
`Request failed.` so the UI never breaks.
