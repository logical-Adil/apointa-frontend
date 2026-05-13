/**
 * Wire-level types for the auth module.
 *
 * Keep this file aligned with the backend contract — when the API changes,
 * update here first and let TypeScript surface the rest of the work.
 */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  /** ISO timestamp. Optional so the dummy client doesn't have to fabricate one. */
  createdAt?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = AuthSession;
