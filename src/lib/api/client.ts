import { env } from "@/lib/env";
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
};

const DEFAULT_TIMEOUT_MS = 15_000;

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = env.apiUrl;
  const slashed = path.startsWith("/") ? path : `/${path}`;
  return `${base}${slashed}`;
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

  if (!response.ok) {
    throw await parseApiError(response);
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
