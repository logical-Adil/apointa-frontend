import { env, getServerApiUrl } from "@/lib/env";
import { ApiError, NETWORK_ERROR_CODE, parseApiError } from "./errors";

type Json = unknown;

export type ApiRequestInit = Omit<RequestInit, "body" | "credentials"> & {
  /** Parsed and JSON-stringified automatically when provided. */
  json?: Json;
  /**
   * Override the default `credentials: "include"`. Only useful for explicit
   * unauthenticated calls — e.g. public health-check endpoints.
   */
  credentials?: RequestCredentials;
  /** Bypass the default timeout. */
  signal?: AbortSignal;
  /** Per-request timeout in ms. Defaults to 15s. */
  timeoutMs?: number;
  /**
   * @internal After a successful `POST /v1/auth/refresh`, the failed request is
   * retried once with this flag so we never recurse.
   */
  _authRetry?: boolean;
};

const DEFAULT_TIMEOUT_MS = 15_000;

const REFRESH_PATH = "/v1/auth/refresh";

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = env.apiUrl;
  const slashed = path.startsWith("/") ? path : `/${path}`;
  if (!base) {
    if (typeof window === "undefined") {
      return `${getServerApiUrl()}${slashed}`;
    }
    return slashed;
  }
  return `${base}${slashed}`;
}

function normalizedPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Do not attempt cookie refresh on these auth routes (avoids loops / noise). */
function isAuthPathExemptFromSilentRefresh(p: string): boolean {
  return (
    p.startsWith("/v1/auth/login") ||
    p.startsWith("/v1/auth/register") ||
    p.startsWith("/v1/auth/refresh") ||
    p.startsWith("/v1/auth/logout")
  );
}

function isAuthPathExemptFromUnauthorizedCacheClear(p: string): boolean {
  return p.startsWith("/v1/auth/login") || p.startsWith("/v1/auth/register");
}

/**
 * Rotates access + refresh httpOnly cookies using the long-lived refresh cookie.
 * Does not use `apiFetch` (would recurse). On success, updates the auth query cache.
 */
async function tryRefreshAccessCookie(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl(REFRESH_PATH), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return true;

    const data = (await res.json()) as {
      user?: { id: string; name: string; email: string; createdAt?: string };
    };
    if (data.user?.id && typeof window !== "undefined") {
      void Promise.all([import("./query-client"), import("./query-keys")]).then(
        ([{ getQueryClient }, { queryKeys }]) => {
          getQueryClient().setQueryData(queryKeys.auth.me(), data.user);
        },
      );
    }
    return true;
  } catch {
    return false;
  }
}

function withTimeout(
  external: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);

  if (external) {
    if (external.aborted) controller.abort(external.reason);
    else external.addEventListener("abort", () => controller.abort(external.reason));
  }

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

/**
 * Typed fetch wrapper used by every feature module.
 *
 * - Prepends `env.apiUrl`.
 * - Sends cookies via `credentials: "include"` so the JWT cookie set by the
 *   backend is delivered on every request. The client never reads the token
 *   itself — auth state is determined by hitting `/v1/auth/me`.
 * - On **401**, tries **`POST /v1/auth/refresh`** once (refresh cookie), then
 *   retries the original request so idle users are not kicked out when the
 *   access JWT expires before the refresh token does.
 * - JSON-encodes the `json` option and sets `Content-Type` accordingly.
 * - Throws `ApiError` for non-2xx responses; bare network / abort failures are
 *   wrapped with `status: 0`.
 * - Returns `undefined` for 204 / empty bodies, otherwise parses JSON.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const {
    json,
    headers,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    credentials = "include",
    _authRetry,
    ...rest
  } = init;

  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Accept")) finalHeaders.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (json !== undefined) {
    body = JSON.stringify(json);
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
  }

  const { signal: timeoutSignal, cancel } = withTimeout(signal, timeoutMs);

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      body,
      headers: finalHeaders,
      credentials,
      signal: timeoutSignal,
    });
  } catch (cause) {
    cancel();
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new ApiError(0, "request_aborted", "Request was cancelled.", undefined, cause);
    }
    throw new ApiError(
      0,
      NETWORK_ERROR_CODE,
      "Cannot reach the server. Check your connection and try again.",
      undefined,
      cause,
    );
  }

  cancel();

  const p = normalizedPath(path);

  if (
    !response.ok &&
    response.status === 401 &&
    typeof window !== "undefined" &&
    !_authRetry &&
    !isAuthPathExemptFromSilentRefresh(p)
  ) {
    const refreshed = await tryRefreshAccessCookie();
    if (refreshed) {
      return apiFetch<T>(path, { ...init, _authRetry: true });
    }
  }

  if (!response.ok) {
    const err = await parseApiError(response);
    if (
      typeof window !== "undefined" &&
      err.isUnauthorized &&
      !isAuthPathExemptFromUnauthorizedCacheClear(p)
    ) {
      void Promise.all([import("./query-client"), import("./query-keys")]).then(
        ([{ getQueryClient }, { queryKeys }]) => {
          getQueryClient().setQueryData(queryKeys.auth.me(), null);
        },
      );
    }
    throw err;
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Sugar wrappers — read like the verbs in your feature files. */
export const api = {
  get: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, json?: Json, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "POST", json }),
  put: <T>(path: string, json?: Json, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "PUT", json }),
  patch: <T>(path: string, json?: Json, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "PATCH", json }),
  delete: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
} as const;
