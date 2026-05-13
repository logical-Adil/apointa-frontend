"use client";

import { useEffect } from "react";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Last-resort boundary for crashes in the root layout itself.
 * Must declare its own <html> and <body>.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Appointa] root error:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col items-center justify-center bg-bg-base px-6 py-16 text-text-primary antialiased">
        <div className="w-full max-w-md text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-danger">
            Critical error
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Appointa couldn&apos;t start.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            Something failed before the app could render. Try reloading — if it keeps happening,
            sign out and back in.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-lg shadow-accent/20 transition-colors hover:bg-accent-hover"
            >
              Reload app
            </button>
            <a
              href="/"
              className="inline-flex min-h-12 min-w-[10rem] items-center justify-center rounded-xl border border-border-strong bg-bg-surface px-6 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-elevated"
            >
              Back to home
            </a>
          </div>

          {error.digest ? (
            <p className="mt-10 font-mono text-xs text-text-muted">
              Reference <span className="select-all text-text-secondary">{error.digest}</span>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
