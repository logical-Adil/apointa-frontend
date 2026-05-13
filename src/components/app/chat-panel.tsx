"use client";

import { useCallback } from "react";
import { ChatComposer } from "@/components/app/chat-composer";
import { MessageList } from "@/components/app/message-list";
import { ConnectionPill } from "@/components/app/connection-pill";
import type { ConnectionStatus, Message } from "@/lib/app/types";

type ChatPanelProps = {
  messages: Message[];
  typing: boolean;
  status: ConnectionStatus;
  onSend: (content: string) => void;
};

export function ChatPanel({ messages, typing, status, onSend }: ChatPanelProps) {
  const handleSend = useCallback(
    (content: string) => {
      onSend(content);
    },
    [onSend],
  );

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-bg-base">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-bg-base/70 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
            Concierge session
          </p>
          <h1 className="mt-0.5 text-base font-semibold tracking-tight text-text-primary sm:text-lg">
            Active conversation
          </h1>
        </div>
        <ConnectionPill status={status} />
      </div>

      <MessageList messages={messages} typing={typing} />

      <ChatComposer status={status} onSend={handleSend} />
    </section>
  );
}
