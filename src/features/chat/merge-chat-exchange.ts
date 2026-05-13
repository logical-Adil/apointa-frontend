import type { ChatMessagesResponse, SendMessageResponse } from "./chat.types";

/**
 * Merges a send/exchange payload into the messages cache without duplicating
 * rows when both REST (mutation) and Socket.io deliver the same pair.
 */
export function mergeChatExchangeIntoCache(
  prev: ChatMessagesResponse | undefined,
  payload: SendMessageResponse,
  options?: { dropTempId?: string },
): ChatMessagesResponse {
  const items = prev?.items ?? [];
  const filtered = items.filter((m) => {
    if (options?.dropTempId && m.id === options.dropTempId) return false;
    if (m.id === payload.userMessage.id) return false;
    if (m.id === payload.assistantMessage.id) return false;
    return true;
  });
  return {
    sessionId: payload.sessionId,
    items: [...filtered, payload.userMessage, payload.assistantMessage],
    booking: payload.booking ?? prev?.booking ?? null,
  };
}
