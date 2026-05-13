/**
 * Public, client-safe environment variables.
 *
 * All fields read from `process.env.NEXT_PUBLIC_*` at build time and are
 * resolved once so the rest of the app imports a typed object instead of
 * reaching for `process.env` directly.
 */

/**
 * When `NEXT_PUBLIC_API_URL` is unset, the client uses same-origin `/v1/...`
 * and `next.config.ts` rewrites those requests to the Express backend so the
 * session cookie stays first-party (see BACKEND_ORIGIN).
 */
const DIRECT_API_FALLBACK = "http://localhost:5000";

function readApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "";
}

/** Used when `apiFetch` runs on the server (no relative URL base). */
export function getServerApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
    process.env.BACKEND_ORIGIN?.trim().replace(/\/+$/, "") ||
    DIRECT_API_FALLBACK
  );
}

export const env = {
  apiUrl: readApiUrl(),
  isDev: process.env.NODE_ENV !== "production",
} as const;

export type Env = typeof env;
