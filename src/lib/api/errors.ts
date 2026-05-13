/**
 * Normalised API error.
 *
 * Backend should return JSON in one of these shapes so the client can map
 * everything onto a single type:
 *
 *   { code, message }
 *   { code, message, errors: { fieldName: "..." | ["..."] } }
 *
 * Any other response (HTML, plain text, network failure) is wrapped with a
 * sensible default so consumers never have to guard for `unknown`.
 */
export class ApiError extends Error {
  readonly name = "ApiError";

  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: Record<string, string>,
    public readonly raw?: unknown,
  ) {
    super(message);
  }

  /** True for 4xx (excluding 401) — the kind we don't want to retry. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** True for 5xx + network — safe to retry. */
  get isServerError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export const NETWORK_ERROR_CODE = "network_error";
export const UNKNOWN_ERROR_CODE = "unknown_error";

type RawErrorBody =
  | {
      code?: string;
      message?: string;
      error?: string;
      errors?: Record<string, string | string[]>;
    }
  | string
  | undefined;

function normaliseFieldErrors(
  errors: Record<string, string | string[]> | undefined,
): Record<string, string> | undefined {
  if (!errors) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      if (value[0]) out[key] = value[0];
    } else if (typeof value === "string" && value.trim()) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function parseApiError(
  response: Response,
  fallbackMessage = "Request failed.",
): Promise<ApiError> {
  let body: RawErrorBody;
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      body = (await response.json()) as RawErrorBody;
    } else {
      body = await response.text();
    }
  } catch {
    body = undefined;
  }

  if (typeof body === "string") {
    return new ApiError(
      response.status,
      `http_${response.status}`,
      body.trim() || fallbackMessage,
      undefined,
      body,
    );
  }

  const message =
    body?.message?.toString() ??
    body?.error?.toString() ??
    fallbackMessage;
  const code = body?.code?.toString() ?? `http_${response.status}`;
  return new ApiError(
    response.status,
    code,
    message,
    normaliseFieldErrors(body?.errors),
    body,
  );
}

/** Friendly, single-line summary for a `formError` banner. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Field map for forms (`Record<fieldName, message>`). */
export function getFieldErrors(
  error: unknown,
): Record<string, string> | undefined {
  if (error instanceof ApiError) return error.fieldErrors;
  return undefined;
}
