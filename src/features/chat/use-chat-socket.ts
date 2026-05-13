"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessagesResponse, SendMessageResponse } from "@/features/chat/chat.types";
import { mergeChatExchangeIntoCache } from "@/features/chat/merge-chat-exchange";
import { queryKeys } from "@/lib/api/query-keys";
import { getChatSocketUrl } from "@/lib/env";
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
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    let connectErrors = 0;

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
      void qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
    };

    const onSessionsUpdated = () => {
      void qc.invalidateQueries({ queryKey: queryKeys.chat.sessions() });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("chat:exchange", onExchange);
    socket.on("chat:sessionsUpdated", onSessionsUpdated);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:exchange", onExchange);
      socket.off("chat:sessionsUpdated", onSessionsUpdated);
      socket.disconnect();
      setStatus("offline");
    };
  }, [isAuthenticated, qc]);

  return status;
}
