"use client";

import { useCallback } from "react";
import { ChatComposer } from "@/components/app/chat-composer";
import { ConnectionPill } from "@/components/app/connection-pill";
import { MessageList } from "@/components/app/message-list";
import { SoundToggle } from "@/components/app/sound-toggle";
import type { BookingExtract, ConnectionStatus, Message } from "@/lib/app/types";

type ChatPanelProps = {
  messages: Message[];
  typing: boolean;
  status: ConnectionStatus;
  /** Active chat session id, or null for the pre-session welcome state. */
  chatSessionId: string | null;
  /** True while the transcript for `chatSessionId` is loading for the first time. */
  messagesLoading: boolean;
  onSend: (content: string) => void;
  onScheduleFromBooking?: (booking: BookingExtract) => void;
};

export function ChatPanel({
  messages,
  typing,
  status,
  chatSessionId,
  messagesLoading,
  onSend,
  onScheduleFromBooking,
}: ChatPanelProps) {
  const handleSend = useCallback(
    (content: string) => {
      onSend(content);
    },
    [onSend],
  );

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-bg-base animate-fade-up animation-delay-1 lg:border-r lg:border-border-subtle">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-bg-elevated/90 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
            Concierge session
          </p>
          <h1 className="mt-0.5 truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">
            Active conversation
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <ConnectionPill status={status} />
          <SoundToggle />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3 lg:p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-[0_1px_0_0_var(--border-subtle)] ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:rounded-2xl">
          {messagesLoading ? (
            <ChatTranscriptLoading />
          ) : (
            <MessageList
              sessionId={chatSessionId}
              messages={messages}
              typing={typing}
              onScheduleFromBooking={onScheduleFromBooking}
            />
          )}
          <ChatComposer status={status} onSend={handleSend} />
        </div>
      </div>
    </section>
  );
}

function ChatTranscriptLoading() {
  return (
    <div
      className="appointa-scrollbar-hidden flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-16"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading conversation</span>
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-2xl bg-accent/15 ring-1 ring-accent/25" />
        <svg
          className="relative size-12 animate-spin text-accent"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2.5"
          />
          <path
            d="M21 12a9 9 0 00-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-center text-sm font-medium text-text-secondary">Loading messages…</p>
    </div>
  );
}
