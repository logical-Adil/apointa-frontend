"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { Message } from "@/lib/app/types";
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

type SendMutationContext = {
  previous?: ChatMessagesResponse;
  tempId?: string;
  sessionId?: string;
};

/**
 * Sends a chat message.
 *
 * When `sessionId` is provided, we optimistically inject the user message into
 * the messages cache so the UI feels instant. On success, the placeholder is
 * replaced by the two real (server-persisted) messages. On error, the cache
 * is rolled back.
 *
 * Consumers can read `mutation.isPending` for the typing indicator and
 * `mutation.data` for the assistant reply.
 */
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation<
    SendMessageResponse,
    unknown,
    SendMessageInput,
    SendMutationContext
  >({
    mutationFn: chatApi.sendMessage,
    onMutate: async (input) => {
      if (!input.sessionId) return { sessionId: undefined };
      const key = queryKeys.chat.messages(input.sessionId);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ChatMessagesResponse>(key);
      const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimistic: Message = {
        id: tempId,
        role: "user",
        content: input.content,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      qc.setQueryData<ChatMessagesResponse>(key, {
        sessionId: input.sessionId,
        items: [...(previous?.items ?? []), optimistic],
        booking: previous?.booking ?? null,
      });
      return { previous, tempId, sessionId: input.sessionId };
    },
    onError: (_err, _input, context) => {
      if (context?.sessionId && context.previous) {
        qc.setQueryData(
          queryKeys.chat.messages(context.sessionId),
          context.previous,
        );
      }
    },
    onSuccess: (response, _input, context) => {
      qc.setQueryData<ChatMessagesResponse | undefined>(
        queryKeys.chat.messages(response.sessionId),
        (prev) => {
          const filtered = (prev?.items ?? []).filter(
            (m) => !context?.tempId || m.id !== context.tempId,
          );
          return {
            sessionId: response.sessionId,
            items: [...filtered, response.userMessage, response.assistantMessage],
            booking: response.booking ?? prev?.booking ?? null,
          };
        },
      );
      qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
    },
  });
}
