"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import * as authApi from "./auth.api";
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "./auth.types";

/**
 * GET /v1/auth/me wrapped so a 401 looks like "logged out, not an error".
 *
 * - `data === undefined` → still resolving (first paint).
 * - `data === null`      → confirmed signed-out.
 * - `data` is a user     → signed-in.
 */
export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) return null;
        throw error;
      }
    },
    // Short stale window so an expired JWT does not leave "logged in" UI for long.
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}

/** Convenience wrapper for components that only care about "is logged in?". */
export function useAuth() {
  const query = useCurrentUser();
  return {
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, unknown, LoginInput>({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      qc.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, unknown, RegisterInput>({
    mutationFn: authApi.register,
    onSuccess: (session) => {
      qc.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<void, unknown, void>({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Backend (or the mock) has cleared the cookie; mirror that in the cache
      // so every `useAuth()` consumer rerenders as signed-out immediately.
      qc.setQueryData(queryKeys.auth.me(), null);
      qc.removeQueries({
        predicate: (query) => {
          const [scope] = query.queryKey;
          return scope === "appointments" || scope === "chat";
        },
      });
    },
  });
}
