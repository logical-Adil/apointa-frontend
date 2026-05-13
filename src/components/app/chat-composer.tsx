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
  function ChatComposer({ status, onSend, disabled = false }, forwardedRef) {
    const [value, setValue] = useState("");
    const [isMultiline, setIsMultiline] = useState(false);
    const innerRef = useRef<HTMLTextAreaElement>(null);

    const setTextareaRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    /** Single-line: vertically center text + send. Wrapped/grows: pin send to bottom. */
    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, 180);
      el.style.height = `${next}px`;
      setIsMultiline(next > 52);
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
            className={`appointa-compose-surface flex min-h-[52px] gap-2.5 rounded-xl border bg-bg-surface px-3 py-2.5 ring-0 transition-[border-color,box-shadow,ring] duration-200 ${
              isMultiline ? "items-end" : "items-center"
            } ${
              overLimit
                ? "border-danger/60"
                : "border-border-subtle focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent/22"
            }`}
          >
            <textarea
              ref={setTextareaRef}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message your concierge…"
              aria-label="Message"
              disabled={disabled}
              className="appointa-scrollbar max-h-[180px] min-h-[2.5rem] flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-[1.65] text-text-primary outline-none focus:outline-none focus-visible:outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              aria-label="Send message"
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-[#0B0F13] outline-none transition-[transform,background-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface hover:enabled:bg-accent-hover hover:enabled:scale-[1.03] active:enabled:scale-[0.94] disabled:cursor-not-allowed disabled:bg-bg-elevated disabled:text-text-muted disabled:hover:scale-100 ${
                isMultiline ? "mb-px" : ""
              }`}
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
