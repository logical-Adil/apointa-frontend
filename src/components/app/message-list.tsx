"use client";

import { useEffect, useRef } from "react";
import type { BookingExtract, Message } from "@/lib/app/types";
import { BookingChip } from "@/components/app/booking-chip";

type MessageListProps = {
  messages: Message[];
  typing: boolean;
  onScheduleFromBooking?: (booking: BookingExtract) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MessageList({ messages, typing, onScheduleFromBooking }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
      aria-live="polite"
      aria-relevant="additions"
    >
      <ol className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {messages.map((m) => (
          <li key={m.id}>
            <MessageBubble message={m} onScheduleFromBooking={onScheduleFromBooking} />
          </li>
        ))}
        {typing ? (
          <li>
            <TypingBubble />
          </li>
        ) : null}
      </ol>
    </div>
  );
}

function MessageBubble({
  message,
  onScheduleFromBooking,
}: {
  message: Message;
  onScheduleFromBooking?: (booking: BookingExtract) => void;
}) {
  const isUser = message.role === "user";
  const canUseBooking =
    !isUser &&
    message.booking &&
    onScheduleFromBooking;
  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <AssistantAvatar /> : null}
      <div className={`flex max-w-[min(100%,40rem)] flex-col sm:max-w-[min(85%,42rem)] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-md bg-accent text-[#0B0F13]"
              : "rounded-bl-md border border-border-subtle bg-bg-elevated text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          }`}
        >
          {message.content}
        </div>
        {message.booking ? (
          <div className="w-full">
            <BookingChip
              booking={message.booking}
              onUseInForm={
                canUseBooking ? () => onScheduleFromBooking(message.booking!) : undefined
              }
            />
          </div>
        ) : null}
        <p
          className={`mt-1 px-1 font-mono text-[10px] text-text-muted ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.createdAt)}
          {isUser && message.status === "sending" ? " · Sending…" : null}
          {isUser && message.status === "failed" ? " · Failed" : null}
        </p>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft ring-1 ring-accent/25">
      <span className="text-xs font-bold text-accent">A</span>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex gap-2.5">
      <AssistantAvatar />
      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border-subtle bg-bg-elevated px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-text-muted"
      style={{ animationDelay: delay }}
      aria-hidden
    />
  );
}
