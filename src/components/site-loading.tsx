"use client";

import { AppointaLogo } from "@/components/appointa-logo";

export type SiteLoadingScreenProps = {
  /** Announced to screen readers only (no visible copy). */
  message?: string;
  submessage?: string;
  /** Skip soft background tint. */
  minimal?: boolean;
};

/**
 * Minimal full-screen loader — theme tokens only, logo + light accent ring.
 */
export function SiteLoadingScreen({
  message = "Loading",
  submessage,
  minimal = false,
}: SiteLoadingScreenProps) {
  return (
    <div
      className="relative flex min-h-[100dvh] w-full items-center justify-center bg-bg-base"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">
        {message}
        {submessage ? `. ${submessage}` : ""}
      </span>

      {!minimal ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.45]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 35%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 65%)",
          }}
        />
      ) : null}

      <div className="animate-loader-enter relative flex items-center justify-center">
        <div className="relative flex size-16 items-center justify-center">
          <div
            className="absolute inset-0 rounded-2xl border-2 border-border-subtle border-t-accent motion-reduce:animate-none motion-reduce:border-border-subtle motion-reduce:opacity-60 animate-spin"
            aria-hidden
          />
          <div className="relative z-10 flex size-14 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:bg-bg-elevated dark:shadow-none dark:ring-white/[0.06]">
            <AppointaLogo compact priority showWordmark={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
