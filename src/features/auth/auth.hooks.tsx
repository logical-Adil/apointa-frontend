"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import * as authApi from "./auth.api";
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "./auth.types";

const AuthQueryContext =
  createContext<UseQueryResult<AuthUser | null> | null>(null);

/**
 * Runs `GET /v1/auth/me` exactly once for the whole app. Mount as a direct
 * child of `QueryClientProvider` (see `AppProviders`).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery<AuthUser | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) return null;
        throw error;
      }
    },
    // Cookie auth only makes sense in the browser; skip SSR so we never
    // double-hit `/me` during RSC + hydration.
    enabled: typeof window !== "undefined",
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <AuthQueryContext.Provider value={query}>{children}</AuthQueryContext.Provider>
  );
}

function useAuthQuery(): UseQueryResult<AuthUser | null> {
  const query = useContext(AuthQueryContext);
  if (!query) {
    throw new Error(
      "Auth hooks require <AuthProvider> inside <QueryClientProvider>.",
    );
  }
  return query;
}

/**
 * Raw TanStack result for `/v1/auth/me` (401 → `null`, not an error).
 *
 * - `data === undefined` → still resolving (first paint).
 * - `data === null`      → confirmed signed-out.
 * - `data` is a user     → signed-in.
 */
export function useCurrentUser() {
  return useAuthQuery();
}

/** Convenience wrapper for components that only care about "is logged in?". */
export function useAuth() {
  const query = useAuthQuery();
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
