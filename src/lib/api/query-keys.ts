/**
 * Centralised query-key factory.
 *
 * Why a factory: prevents typos like `["appointment"]` vs `["appointments"]`,
 * keeps invalidation type-safe (`qc.invalidateQueries({ queryKey: queryKeys.appointments.all })`),
 * and gives a single place to discover what is cached.
 *
 * Convention: each module exposes
 *   - `all`     — broad key, invalidated when anything in the module changes.
 *   - `list(f)` — keyed by filters.
 *   - `detail(id)` — keyed by id.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: { tab?: string; from?: string; to?: string }) =>
      ["appointments", "list", filters ?? {}] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
  },
  chat: {
    all: ["chat"] as const,
    sessions: () => ["chat", "sessions"] as const,
    session: (sessionId: string) => ["chat", "session", sessionId] as const,
    messages: (sessionId: string) =>
      ["chat", "messages", sessionId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
