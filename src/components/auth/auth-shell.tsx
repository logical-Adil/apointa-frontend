import Link from "next/link";
import type { ReactNode } from "react";
import { AppointaLogo } from "@/components/appointa-logo";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellProps = {
  /** Form column content (heading, inputs, CTA) */
  children: ReactNode;
  /** Eyebrow shown above the visual side */
  sideEyebrow?: string;
  /** Headline on the visual side */
  sideTitle?: string;
  /** Supporting copy on the visual side */
  sideBody?: string;
};

export function AuthShell({
  children,
  sideEyebrow = "Appointa concierge",
  sideTitle = "Pick up where you left off.",
  sideBody = "Your sessions, extracted booking details, and upcoming appointments stay together in one calm workspace.",
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-[-25%] h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[40vh] w-[50vw] max-w-xl rounded-full bg-info/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative flex flex-col px-4 pb-12 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pb-16 lg:pt-10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="rounded-xl outline-offset-4"
              aria-label="Appointa home"
            >
              <AppointaLogo priority />
            </Link>
            <ThemeToggle />
          </div>

          <div className="mt-12 flex flex-1 items-center justify-center sm:mt-16 lg:mt-8">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <p className="mt-10 text-center text-xs text-text-muted sm:mt-12">
            By continuing you accept the assessment prototype terms. No production data is processed.
          </p>
        </section>

        <aside
          className="relative hidden overflow-hidden border-l border-border-subtle bg-bg-surface lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12"
          aria-hidden
        >
          <div
            className="pointer-events-none absolute -right-24 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
              {sideEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-text-primary xl:text-4xl">
              {sideTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
              {sideBody}
            </p>
          </div>

          <div className="relative mt-12 max-w-md">
            <MiniChatPreview />
          </div>
        </aside>
      </div>
    </div>
  );
}

function MiniChatPreview() {
  return (
    <div className="rounded-2xl border border-border-strong bg-bg-elevated p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          <span className="text-xs font-medium text-text-secondary">Yesterday · 4:21 PM</span>
        </div>
        <span className="rounded-lg bg-accent-soft px-2 py-1 font-mono text-[11px] font-medium text-accent">
          Preview
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-[#0B0F13]">
            Move my Thursday call to Friday 2 PM if possible.
          </div>
        </div>
        <div className="flex gap-2">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft ring-1 ring-accent/20">
            <span className="text-[11px] font-bold text-accent">A</span>
          </div>
          <div className="rounded-2xl rounded-bl-md border border-border-subtle bg-bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text-primary">
            Rescheduled. Friday <span className="font-medium text-accent">2:00 PM</span> is confirmed. Calendar updated.
          </div>
        </div>
      </div>
    </div>
  );
}
