import { QueryClient, isServer } from "@tanstack/react-query";
import { ApiError } from "./errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /** Fresh long enough that remounts / parent re-renders reuse cache instead of firing the same GET again. */
        staleTime: 2 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        /** While data is still "fresh" (within staleTime), mounting does not trigger another network request. */
        refetchOnMount: true,
        refetchOnReconnect: true,
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
