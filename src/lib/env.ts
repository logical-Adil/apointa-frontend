/**
 * Public, client-safe environment variables.
 *
 * All fields read from `process.env.NEXT_PUBLIC_*` at build time and are
 * resolved once so the rest of the app imports a typed object instead of
 * reaching for `process.env` directly.
 */

/** Must match backend `PORT` (see `backend/.env.example`, default 5000). */
const DEFAULT_API_URL = "http://localhost:5000";

function readApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return DEFAULT_API_URL;
  return raw.replace(/\/+$/, "");
}

export const env = {
  apiUrl: readApiUrl(),
  isDev: process.env.NODE_ENV !== "production",
} as const;

export type Env = typeof env;
