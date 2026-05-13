import { QueryClient, isServer } from "@tanstack/react-query";
import { ApiError } from "./errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Treat data fresh for 30s; tune per-feature when needed.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.isClientError) return false;
            return failureCount < 2;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        // Mutations are user-initiated — don't auto-retry by default.
        retry: false,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/**
 * SSR-safe accessor. Server gets a fresh client per render; the browser
 * memoises a single instance so cached data survives navigations.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}
