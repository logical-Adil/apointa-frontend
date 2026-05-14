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

/**
 * Next.js `basePath` (e.g. `/appointa-client`). Set `NEXT_PUBLIC_BASE_PATH` at
 * build time to match nginx. Used for links outside the Next `<Link>` tree.
 */
export function getPublicBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
  if (!raw || raw === "/") return "";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "";
}

/** Home URL for raw `<a href>` (e.g. global error boundary). */
export function getHomeHref(): string {
  const b = getPublicBasePath();
  return b ? `${b}/` : "/";
}

/** Engine.IO mount path (nginx may expose `/appointa-backend/socket.io`). */
export function getSocketIoPath(): string {
  const raw = process.env.NEXT_PUBLIC_SOCKET_IO_PATH?.trim();
  if (raw) return raw.startsWith("/") ? raw : `/${raw}`;
  return "/socket.io";
}

/** Used when `apiFetch` runs on the server (no relative URL base). */
export function getServerApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ||
    process.env.BACKEND_ORIGIN?.trim().replace(/\/+$/, "") ||
    DIRECT_API_FALLBACK
  );
}

/**
 * Base URL for Socket.io (browser). Prefer same-origin when the API uses
 * Next.js rewrites so the session cookie is sent. Override with
 * `NEXT_PUBLIC_SOCKET_URL` when needed.
 */
export function getChatSocketUrl(): string {
  const socketUrlOverride = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (socketUrlOverride) return socketUrlOverride.replace(/\/+$/, "");

  const api = readApiUrl();
  if (api) {
    try {
      return new URL(api).origin;
    } catch {
      return api.replace(/\/+$/, "");
    }
  }

  if (typeof window !== "undefined") {
    const bp = getPublicBasePath();
    if (bp) return `${window.location.origin}${bp}`;
    return window.location.origin;
  }

  return DIRECT_API_FALLBACK;
}

export const env = {
  apiUrl: readApiUrl(),
  isDev: process.env.NODE_ENV !== "production",
} as const;

export type Env = typeof env;
