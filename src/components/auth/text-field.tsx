"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "type"> & {
  label: string;
  type?: "text" | "email" | "password";
  hint?: string;
  error?: string | null;
  /** Right-aligned helper (e.g. "Forgot password?") */
  labelAccessory?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, type = "text", hint, error, labelAccessory, className = "", ...props },
    ref,
  ) {
    const reactId = useId();
    const inputId = `field-${reactId}`;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (revealed ? "text" : "password") : type;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
          {labelAccessory ? <div className="text-xs">{labelAccessory}</div> : null}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`block w-full rounded-xl border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-accent focus:bg-bg-elevated focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              error
                ? "border-danger/70 focus:border-danger focus:ring-danger/30"
                : "border-border-subtle hover:border-border-strong"
            } ${isPassword ? "pr-11" : ""}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              className="absolute inset-y-0 right-2 my-auto inline-flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-bg-base hover:text-text-primary"
              tabIndex={-1}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
        </div>

        {hint && !error ? (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            className="text-xs font-medium text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

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
