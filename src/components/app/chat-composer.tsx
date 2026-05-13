"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ConnectionPill } from "@/components/app/connection-pill";
import type { ConnectionStatus } from "@/lib/app/types";

type ChatComposerProps = {
  status: ConnectionStatus;
  onSend: (content: string) => void;
  disabled?: boolean;
};

const MAX_CHARS = 2000;

export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  function ChatComposer({ status, onSend, disabled = false }, _ref) {
    const [value, setValue] = useState("");
    const innerRef = useRef<HTMLTextAreaElement>(null);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }, []);

    useEffect(() => {
      resize();
    }, [value, resize]);

    function send() {
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setValue("");
    }

    function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    }

    const overLimit = value.length > MAX_CHARS;
    const canSend = !disabled && !overLimit && value.trim().length > 0;

    return (
      <div className="shrink-0 border-t border-border-subtle bg-bg-elevated/80 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <div
            className={`flex items-end gap-2 rounded-2xl border bg-bg-surface px-3 py-2.5 transition-colors ${
              overLimit ? "border-danger/60" : "border-border-subtle focus-within:border-accent"
            }`}
          >
            <textarea
              ref={innerRef}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message your concierge…"
              aria-label="Message"
              disabled={disabled}
              className="max-h-[180px] min-h-[36px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-text-primary placeholder:text-text-muted outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label="Send message"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-[#0B0F13] transition-all duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-bg-elevated disabled:text-text-muted"
            >
              <SendIcon />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-text-muted">
            <div className="flex items-center gap-2">
              <ConnectionPill status={status} />
              <span className="hidden sm:inline">
                <kbd className="rounded border border-border-subtle bg-bg-surface px-1 py-0.5 font-mono text-[10px] text-text-secondary">Enter</kbd> to send ·{" "}
                <kbd className="rounded border border-border-subtle bg-bg-surface px-1 py-0.5 font-mono text-[10px] text-text-secondary">Shift</kbd>+
                <kbd className="rounded border border-border-subtle bg-bg-surface px-1 py-0.5 font-mono text-[10px] text-text-secondary">Enter</kbd> for newline
              </span>
            </div>
            <span className={overLimit ? "font-medium text-danger" : "text-text-muted"}>
              {value.length}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

function SendIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5" />
    </svg>
  );
}
