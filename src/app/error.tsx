"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppointaLogo } from "@/components/appointa-logo";
import { ThemeToggle } from "@/components/theme-toggle";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface for local debugging; replace with telemetry once wired.
    console.error("[Appointa] route error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[min(90vw,560px)] w-[min(90vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[35vh] w-[45vw] max-w-md rounded-full bg-warning/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute inset-0 flex select-none items-center justify-center pt-24 font-mono text-[clamp(8rem,22vw,14rem)] font-bold leading-none tracking-tighter text-danger/[0.07]"
          aria-hidden
        >
          ERR
        </div>
      </div>

      <header className="relative z-10 border-b border-border-subtle/80 bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Link href="/" className="rounded-xl outline-offset-4" aria-label="Appointa home">
            <AppointaLogo priority />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="animate-fade-up w-full max-w-lg text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-danger">
            Something went wrong
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            We hit an unexpected error.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Sorry about that. The page failed to render. You can try again — most of the time, a retry
            is enough. If it keeps happening, head back home.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 min-w-[10.5rem] items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30"
            >
              <RetryIcon />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-12 min-w-[10.5rem] items-center justify-center rounded-xl border border-border-strong bg-bg-surface px-6 text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-accent/35 hover:bg-bg-elevated"
            >
              Back to home
            </Link>
          </div>

          {error.digest ? (
            <p className="mt-12 font-mono text-xs text-text-muted">
              Reference{" "}
              <span className="select-all text-text-secondary">{error.digest}</span>
            </p>
          ) : (
            <p className="mt-12 font-mono text-xs text-text-muted">
              Error code <span className="text-text-secondary">RUNTIME</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function RetryIcon() {
  return (
    <svg
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992M3.181 9.348a8.25 8.25 0 0113.803-3.7l3.181 3.7M20.819 14.652a8.25 8.25 0 01-13.803 3.7L3.836 14.652"
      />
    </svg>
  );
}
