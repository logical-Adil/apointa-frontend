"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef } from "react";
import { BookingChip } from "@/components/app/booking-chip";
import { formatTime } from "@/lib/app/date-format";
import type { BookingExtract, Message } from "@/lib/app/types";

/** Served from `client/public/chatbox ai.png` */
const ASSISTANT_AVATAR_SRC = "/chatbox%20ai.png";

const NEAR_BOTTOM_PX = 100;

function scrollStorageKey(sessionId: string) {
  return `appointa-chat-scroll:${sessionId}`;
}

type MessageListProps = {
  /** Persist scroll against this id; omit persistence when null. */
  sessionId: string | null;
  messages: Message[];
  typing: boolean;
  onScheduleFromBooking?: (booking: BookingExtract) => void;
};

export function MessageList({
  sessionId,
  messages,
  typing,
  onScheduleFromBooking,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSessionIdRef = useRef<string | null | undefined>(undefined);
  const prevLenRef = useRef(0);
  const nearBottomRef = useRef(true);

  const persistScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || !sessionId) return;
    try {
      sessionStorage.setItem(scrollStorageKey(sessionId), String(Math.max(0, el.scrollTop)));
    } catch {
      /* ignore quota / private mode */
    }
  }, [sessionId]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottomRef.current = dist < NEAR_BOTTOM_PX;
    persistScroll();
  }, [persistScroll]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const sid = sessionId ?? null;

    if (lastSessionIdRef.current !== sid) {
      lastSessionIdRef.current = sid;
      const raw = sid ? sessionStorage.getItem(scrollStorageKey(sid)) : null;
      el.scrollTop = raw != null ? Number.parseInt(raw, 10) || 0 : 0;
      prevLenRef.current = messages.length;
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      nearBottomRef.current = dist < NEAR_BOTTOM_PX;
      return;
    }

    const grew = messages.length > prevLenRef.current;
    prevLenRef.current = messages.length;

    if (grew) {
      const last = messages[messages.length - 1];
      if (last?.role === "user" || nearBottomRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
      const distAfter = el.scrollHeight - el.scrollTop - el.clientHeight;
      nearBottomRef.current = distAfter < NEAR_BOTTOM_PX;
      return;
    }

    if (typing && nearBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, sessionId, typing]);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="appointa-scrollbar-hidden flex min-h-0 flex-1 overflow-y-auto px-3 pb-16 pt-4 pr-2 sm:px-5 sm:pb-20 sm:pt-5 sm:pr-3"
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
  const booking = message.booking;
  const bookingComplete =
    Boolean(booking) && booking!.missingFields.length === 0;
  const canOpenScheduleForm =
    !isUser && booking && onScheduleFromBooking && bookingComplete;
  return (
    <div
      className={`flex items-start gap-2.5 ${isUser ? "animate-chat-msg-user justify-end" : "animate-chat-msg-assistant justify-start"}`}
    >
      {!isUser ? <AssistantAvatar /> : null}
      <div
        className={`flex min-w-0 max-w-[min(100%,40rem)] flex-col sm:max-w-[min(90%,42rem)] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`w-fit max-w-full min-w-0 px-5 py-4 text-[0.9375rem] leading-[1.65] [overflow-wrap:anywhere] ${
            isUser
              ? "rounded-xl rounded-br-md bg-accent text-right text-[#0B0F13] shadow-[0_2px_12px_-2px_rgba(13,148,136,0.35)] ring-1 ring-black/[0.06] dark:shadow-[0_2px_16px_-2px_rgba(45,212,191,0.25)] dark:ring-white/[0.1]"
              : "rounded-xl rounded-bl-md border border-border-subtle/80 bg-bg-elevated text-left text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] dark:bg-bg-surface dark:shadow-[0_2px_14px_rgba(0,0,0,0.22)] dark:ring-white/[0.05]"
          }`}
        >
          {message.content}
        </div>
        {message.booking ? (
          <div className="mt-2.5 w-full animate-chat-chip-in">
            <BookingChip
              className="mt-0"
              booking={message.booking}
              showIncompleteHint={Boolean(onScheduleFromBooking)}
              onUseInForm={
                canOpenScheduleForm
                  ? () => onScheduleFromBooking!(message.booking!)
                  : undefined
              }
            />
          </div>
        ) : null}
        <p
          className={`font-mono text-[10px] text-text-muted ${
            isUser
              ? "mt-2 px-1 pb-1 text-right"
              : booking
                ? "pl-1.5 pr-1 pt-1 text-left"
                : "pl-1.5 pr-1 pt-2.5 text-left"
          } ${!isUser ? "mb-5 sm:mb-6" : ""}`}
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
    <div
      className="animate-chat-avatar-float mt-0.5 shrink-0"
      aria-hidden
    >
      <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-accent-soft p-0.5 ring-1 ring-accent/25">
        <span className="relative block size-[34px] shrink-0 overflow-hidden rounded-[10px]">
          <Image
            src={ASSISTANT_AVATAR_SRC}
            alt=""
            fill
            sizes="34px"
            className="object-cover"
            draggable={false}
            priority={false}
          />
        </span>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex animate-chat-msg-assistant items-start gap-2.5">
      <AssistantAvatar />
      <div className="inline-flex items-center gap-1.5 rounded-xl rounded-bl-md border border-border-subtle/80 bg-bg-elevated px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] dark:bg-bg-surface dark:shadow-[0_2px_14px_rgba(0,0,0,0.22)] dark:ring-white/[0.05]">
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
