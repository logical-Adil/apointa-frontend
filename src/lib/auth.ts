import type { CurrentUser } from "@/lib/app/types";

/**
 * Dummy client-side auth: stores a fake token + user in localStorage.
 * Replace with a real API client (POST /v1/auth/login) once the backend is wired.
 */

const TOKEN_KEY = "appointa.token";
const USER_KEY = "appointa.user";

export type StoredAuth = {
  token: string;
  user: CurrentUser;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function randomToken() {
  const arr = new Uint8Array(24);
  if (isBrowser() && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "user";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "User";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function signIn(email: string): StoredAuth {
  const trimmed = email.trim().toLowerCase();
  const auth: StoredAuth = {
    token: randomToken(),
    user: { name: nameFromEmail(trimmed), email: trimmed },
  };
  if (isBrowser()) {
    window.localStorage.setItem(TOKEN_KEY, auth.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }
  return auth;
}

export function signUp(name: string, email: string): StoredAuth {
  const trimmed = email.trim().toLowerCase();
  const auth: StoredAuth = {
    token: randomToken(),
    user: { name: name.trim() || nameFromEmail(trimmed), email: trimmed },
  };
  if (isBrowser()) {
    window.localStorage.setItem(TOKEN_KEY, auth.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  }
  return auth;
}

export function signOut() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
