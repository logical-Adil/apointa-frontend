import Link from "next/link";
import { AppointaLogo } from "@/components/appointa-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[min(90vw,560px)] w-[min(90vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[35vh] w-[45vw] max-w-md rounded-full bg-info/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pt-24 font-mono text-[clamp(8rem,22vw,14rem)] font-bold leading-none tracking-tighter text-accent/[0.06] select-none"
          aria-hidden
        >
          404
        </div>
      </div>

      <header className="relative z-10 border-b border-border-subtle/80 bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2 px-3 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <Link href="/" className="rounded-xl outline-offset-4" aria-label="Appointa home">
            <AppointaLogo priority />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-3 py-12 sm:px-6 sm:py-16">
        <div className="animate-fade-up w-full max-w-lg px-1 text-center sm:px-0">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Page not found
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            This path doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            The link may be broken or the page was moved. Head back to Appointa and continue from your
            dashboard or sign in again.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 sm:w-auto sm:min-w-[10.5rem]"
            >
              Back to home
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border-strong bg-bg-surface px-6 text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-accent/35 hover:bg-bg-elevated sm:w-auto sm:min-w-[10.5rem]"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-12 font-mono text-xs text-text-muted">
            Error code <span className="text-text-secondary">HTTP 404</span>
          </p>
        </div>
      </main>
    </div>
  );
}
