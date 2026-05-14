"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessagesResponse, SendMessageResponse } from "@/features/chat/chat.types";
import { mergeChatExchangeIntoCache } from "@/features/chat/merge-chat-exchange";
import { queryKeys } from "@/lib/api/query-keys";
import { getChatSocketUrl, getSocketIoPath } from "@/lib/env";
import type { ConnectionStatus } from "@/lib/app/types";

/**
 * Lightweight Socket.io client for chat: keeps the connection pill accurate
 * and syncs TanStack Query when the server broadcasts new exchanges (e.g.
 * second browser tab).
 */
export function useChatSocket(isAuthenticated: boolean): ConnectionStatus {
  const qc = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("offline");

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus("offline");
      return;
    }

    const url = getChatSocketUrl();
    setStatus("connecting");

    const socket: Socket = io(url, {
      path: getSocketIoPath(),
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    let connectErrors = 0;
    /** Coalesce `chat:exchange` + `chat:sessionsUpdated` (and createSession double emit) into one refetch. */
    let sessionsBounce: ReturnType<typeof setTimeout> | null = null;
    const scheduleSessionsRefetch = () => {
      if (sessionsBounce) clearTimeout(sessionsBounce);
      sessionsBounce = setTimeout(() => {
        sessionsBounce = null;
        void qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
      }, 80);
    };

    const onConnect = () => {
      connectErrors = 0;
      setStatus("connected");
    };
    const onDisconnect = (reason: string) => {
      if (reason === "io client disconnect") {
        setStatus("offline");
        return;
      }
      setStatus("reconnecting");
    };
    const onConnectError = () => {
      connectErrors += 1;
      setStatus(connectErrors >= 10 ? "offline" : "reconnecting");
    };

    const onExchange = (payload: SendMessageResponse) => {
      qc.setQueryData<ChatMessagesResponse>(
        queryKeys.chat.messages(payload.sessionId),
        (prev) => mergeChatExchangeIntoCache(prev, payload),
      );
      scheduleSessionsRefetch();
    };

    const onSessionsUpdated = () => {
      scheduleSessionsRefetch();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("chat:exchange", onExchange);
    socket.on("chat:sessionsUpdated", onSessionsUpdated);

    return () => {
      if (sessionsBounce) clearTimeout(sessionsBounce);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:exchange", onExchange);
      socket.off("chat:sessionsUpdated", onSessionsUpdated);
      socket.disconnect();
      setStatus("offline");
    };
    // qc from useQueryClient() is stable; omitting avoids effect churn that reconnects the socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- qc stable from @tanstack/react-query
  }, [isAuthenticated]);

  return status;
}
