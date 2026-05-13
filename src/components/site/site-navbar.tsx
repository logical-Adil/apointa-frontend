"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppointaLogo } from "@/components/appointa-logo";
import { UserMenu } from "@/components/app/user-menu";
import { HeaderAuthCTA } from "@/components/landing/auth-cta";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/auth";

export function SiteNavbar() {
  const pathname = usePathname() ?? "";
  const { user, isAuthenticated } = useAuth();
  const onHome = pathname === "/";
  const onAuth = pathname === "/login" || pathname === "/register";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle/80 bg-bg-base/80 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex h-[3.5rem] max-w-[1400px] items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="min-w-0 shrink rounded-xl py-1 outline-offset-4 transition-opacity hover:opacity-90"
            aria-label="Appointa home"
          >
            <AppointaLogo priority className="min-w-0" />
          </Link>
          {onAuth ? (
            <>
              <span
                className="hidden h-6 w-px shrink-0 bg-border-subtle sm:block"
                aria-hidden
              />
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary sm:inline-flex"
              >
                <HomeChevronIcon className="size-4 shrink-0 opacity-70" />
                Home
              </Link>
            </>
          ) : null}
        </div>

        <nav className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2.5" aria-label="Site">
          {onHome ? (
            <a
              href="#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary md:inline"
            >
              Features
            </a>
          ) : null}
          <ThemeToggle />
          {isAuthenticated && user ? (
            <UserMenu user={{ name: user.name, email: user.email }} />
          ) : (
            <HeaderAuthCTA />
          )}
        </nav>
      </div>
    </header>
  );
}

function HomeChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
    </svg>
  );
}
