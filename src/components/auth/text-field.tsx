"use client";

import {
  forwardRef,
  useCallback,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "type"> & {
  label: string;
  type?: "text" | "email" | "password";
  hint?: string;
  error?: string | null;
  /** Right-aligned label helper (e.g. a "Forgot password?" link) */
  labelAccessory?: ReactNode;
  /** Leading icon inside the input */
  leadingIcon?: "email" | "password" | "user";
  /** Dark auth panel (login/register reflex layout) */
  variant?: "default" | "reflex";
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      type = "text",
      hint,
      error,
      labelAccessory,
      leadingIcon,
      variant = "default",
      className = "",
      onKeyDown,
      onKeyUp,
      onBlur,
      ...props
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = `field-${reactId}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const capsId = `${inputId}-caps`;

    const [revealed, setRevealed] = useState(false);
    const [capsOn, setCapsOn] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (revealed ? "text" : "password") : type;
    const hasLeading = Boolean(leadingIcon);
    const reflex = variant === "reflex";

    const describedBy = [hintId, errorId, capsOn ? capsId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

    const detectCaps = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (!isPassword) return;
        if (typeof event.getModifierState !== "function") return;
        setCapsOn(event.getModifierState("CapsLock"));
      },
      [isPassword],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      detectCaps(event);
      onKeyDown?.(event);
    };

    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
      detectCaps(event);
      onKeyUp?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (isPassword) setCapsOn(false);
      onBlur?.(event);
    };

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className={
              reflex
                ? "text-[13px] font-medium tracking-wide text-slate-200"
                : "text-sm font-medium text-text-primary"
            }
          >
            {label}
          </label>
          {labelAccessory ? (
            <div className="flex shrink-0 items-center justify-end">{labelAccessory}</div>
          ) : null}
        </div>

        <div className="relative">
          {hasLeading ? (
            <span
              className={`pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 [&_svg]:size-[18px] ${
                reflex ? "text-slate-500" : "text-text-muted"
              }`}
              aria-hidden
            >
              {leadingIcon === "email" ? <MailIcon /> : null}
              {leadingIcon === "password" ? <LockGlyphIcon /> : null}
              {leadingIcon === "user" ? <UserGlyphIcon /> : null}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
            className={`block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              hasLeading ? "pl-10" : ""
            } ${
              reflex
                ? `bg-[#0c1012] text-slate-100 placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/25 ${
                    error
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700/80 hover:border-slate-600"
                  }`
                : `bg-bg-surface text-text-primary placeholder:text-text-muted focus:border-accent focus:bg-bg-elevated focus:ring-2 focus:ring-accent/30 ${
                    error
                      ? "border-danger/70 focus:border-danger focus:ring-danger/30"
                      : "border-border-subtle hover:border-border-strong"
                  }`
            } ${isPassword ? "pr-11" : ""}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              className={`absolute inset-y-0 right-2 my-auto inline-flex size-9 items-center justify-center rounded-lg transition-colors duration-150 ${
                reflex
                  ? "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  : "text-text-muted hover:bg-bg-base hover:text-text-primary"
              }`}
              tabIndex={-1}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
        </div>

        {/* Helper row — priority: error > caps lock > hint */}
        {error ? (
          <p
            id={errorId}
            className="text-xs font-medium text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : isPassword && capsOn ? (
          <p
            id={capsId}
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-warning"
          >
            <CapsIcon />
            Caps Lock is on
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 7h16v10H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockGlyphIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function UserGlyphIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function CapsIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4 5 11h4v5h6v-5h4l-7-7Z"
      />
      <path strokeLinecap="round" d="M8 20h8" />
    </svg>
  );
}
