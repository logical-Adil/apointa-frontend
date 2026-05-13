import type { ReactNode } from "react";

/**
 * Centered auth layout: soft page mesh + form card with grid pattern and
 * accent radial wash. Matches `SiteNavbar` / `SiteFooter` tokens.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg-base">
      <PageBackdrop />

      <div className="relative z-[1] mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
        <FormSurface>{children}</FormSurface>
      </div>
    </div>
  );
}

function PageBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-bg-base to-info/[0.05]" />
      <div className="absolute left-1/2 top-[-18%] h-[min(72vw,480px)] w-[min(72vw,480px)] -translate-x-1/2 rounded-full bg-accent/[0.12] blur-[100px]" />
      <div className="absolute bottom-[-12%] right-[-8%] h-[min(50vw,360px)] w-[min(50vw,360px)] rounded-full bg-info/[0.08] blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--border-subtle) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 35%, black 20%, transparent 100%)",
        }}
      />
    </div>
  );
}

function FormSurface({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated/95 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md">
      {/* Fine grid inside the card */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--border-strong) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      {/* Accent spotlight + vertical depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_65%_at_50%_-15%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-base/[0.12] via-transparent to-accent/[0.04]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/35"
        aria-hidden
      />

      <div className="relative z-10 p-6 sm:p-8">{children}</div>
    </div>
  );
}
