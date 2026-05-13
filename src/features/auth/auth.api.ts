import { api } from "@/lib/api/client";
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "./auth.types";

const BASE = "/v1/auth";

/** POST /v1/auth/login — backend sets the httpOnly session cookie on success. */
export function login(input: LoginInput): Promise<AuthResponse> {
  return api.post<AuthResponse>(`${BASE}/login`, input);
}

/** POST /v1/auth/register — same cookie contract as login. */
export function register(input: RegisterInput): Promise<AuthResponse> {
  return api.post<AuthResponse>(`${BASE}/register`, input);
}

/**
 * GET /v1/auth/me — single source of truth for "is this browser signed in".
 * Returns the user on 2xx, throws `ApiError(401, ...)` when the cookie is
 * missing or invalid.
 */
export function getCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>(`${BASE}/me`);
}

/**
 * POST /v1/auth/logout — backend clears the cookie. Failures are swallowed
 * (the client cache is cleared anyway) so an offline user can still sign out.
 */
export function logout(): Promise<void> {
  return api.post<void>(`${BASE}/logout`).catch(() => undefined);
}
