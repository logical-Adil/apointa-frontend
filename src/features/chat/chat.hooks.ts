"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import * as chatApi from "./chat.api";
import type {
  ChatMessagesResponse,
  ChatSession,
  ChatSessionListResponse,
  CreateSessionInput,
  SendMessageInput,
  SendMessageResponse,
} from "./chat.types";

export function useChatSessions(options?: { enabled?: boolean }) {
  return useQuery<ChatSessionListResponse>({
    queryKey: queryKeys.chat.sessions(),
    queryFn: chatApi.listSessions,
    enabled: options?.enabled ?? true,
  });
}

export function useChatMessages(
  sessionId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<ChatMessagesResponse>({
    queryKey: queryKeys.chat.messages(sessionId ?? "__none__"),
    queryFn: () => chatApi.getMessages(sessionId as string),
    enabled: Boolean(sessionId) && (options?.enabled ?? true),
  });
}

export function useCreateChatSession() {
  const qc = useQueryClient();
  return useMutation<ChatSession, unknown, CreateSessionInput | void>({
    mutationFn: (input) => chatApi.createSession(input ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
    },
  });
}

/**
 * Sends a chat message. Consumers can read `mutation.isPending` for the
 * typing indicator and `mutation.data` for the assistant reply.
 */
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation<SendMessageResponse, unknown, SendMessageInput>({
    mutationFn: chatApi.sendMessage,
    onSuccess: (response) => {
      qc.setQueryData<ChatMessagesResponse | undefined>(
        queryKeys.chat.messages(response.sessionId),
        (prev) => {
          const items = prev?.items ?? [];
          return {
            sessionId: response.sessionId,
            items: [...items, response.userMessage, response.assistantMessage],
            booking: response.booking ?? prev?.booking ?? null,
          };
        },
      );
      qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
    },
  });
}
