"use client";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-border-subtle bg-bg-base/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-2.5 px-4 py-3.5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex size-5 items-center justify-center rounded-md bg-accent-soft ring-1 ring-accent/25"
            aria-hidden
          >
            <span className="size-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-sm font-medium tracking-tight text-text-primary">
            Appointa
          </span>
          <span className="hidden text-border-strong sm:inline" aria-hidden>
            ·
          </span>
          <span className="hidden text-[13px] leading-none text-text-secondary sm:inline">
            Scheduling, in plain language.
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(34,197,94,0.16)]"
              aria-hidden
            />
            All systems normal
          </span>
          <span className="h-3 w-px bg-border-subtle" aria-hidden />
          <span>© {year} Appointa</span>
        </div>
      </div>
    </footer>
  );
}
