"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { getQueryClient } from "@/lib/api/query-client";
import { env } from "@/lib/env";

/**
 * Single client-side wrapper around every async/data provider.
 * Add more providers (theme, auth, websocket) here as they appear so the
 * root layout stays a one-liner.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {env.isDev ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        ) : null}
      </AuthProvider>
    </QueryClientProvider>
  );
}
