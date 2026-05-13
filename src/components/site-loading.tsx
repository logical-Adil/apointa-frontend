"use client";

import { AppointaLogo } from "@/components/appointa-logo";

export type SiteLoadingScreenProps = {
  /** Primary line under the mark (e.g. “Checking your session”). */
  message?: string;
  /** Smaller supporting line. */
  submessage?: string;
  /** Visually hide decorative layers for a11y testers; keeps live region. */
  minimal?: boolean;
};

/**
 * Full-viewport branded loader — use for route `loading.tsx`, auth gates, and
 * anywhere the app needs a consistent “Appointa is working” moment.
 */
export function SiteLoadingScreen({
  message = "Loading",
  submessage,
  minimal = false,
}: SiteLoadingScreenProps) {
  return (
    <div
      className="appointa-site-loading relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-bg-base px-4"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">
        {message}
        {submessage ? `. ${submessage}` : ""}
      </span>

      {!minimal ? (
        <>
          <div className="appointa-site-loading__glow pointer-events-none absolute inset-0 -z-10" aria-hidden />
          <div
            className="appointa-site-loading__grid pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
            aria-hidden
          />
        </>
      ) : null}

      <div className="appointa-site-loading__content relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="appointa-site-loading__rings relative flex size-32 items-center justify-center sm:size-36">
          <span
            className="appointa-site-loading__ring appointa-site-loading__ring--outer absolute inset-0 rounded-full border-2 border-accent/15 motion-reduce:border-accent/25"
            aria-hidden
          />
          <span
            className="appointa-site-loading__ring appointa-site-loading__ring--mid absolute inset-[5px] rounded-full border-2 border-transparent border-t-accent/90 border-r-accent/25"
            aria-hidden
          />
          <span
            className="appointa-site-loading__ring appointa-site-loading__ring--inner absolute inset-[11px] rounded-full border-2 border-transparent border-b-accent/80 border-l-accent/30"
            aria-hidden
          />
          <span
            className="appointa-site-loading__core relative flex size-[4.25rem] items-center justify-center rounded-2xl border border-border-subtle bg-bg-elevated/90 shadow-lg shadow-black/20 ring-1 ring-black/[0.06] backdrop-blur-md dark:shadow-black/40 dark:ring-white/[0.06]"
            aria-hidden
          >
            <AppointaLogo compact priority showWordmark={false} className="scale-110" />
          </span>
        </div>

        <div className="max-w-sm space-y-2 animate-fade-in">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-accent sm:text-xs">
            Appointa
          </p>
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{message}</p>
          {submessage ? (
            <p className="text-sm leading-relaxed text-text-secondary sm:text-base">{submessage}</p>
          ) : null}
        </div>

        <div
          className="appointa-site-loading__bar mt-2 h-1 w-48 max-w-[min(18rem,calc(100vw-3rem))] overflow-hidden rounded-full bg-border-subtle sm:w-56"
          aria-hidden
        >
          <span className="appointa-site-loading__bar-fill block h-full w-1/3 rounded-full bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
        </div>
      </div>
    </div>
  );
}
