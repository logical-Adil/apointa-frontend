"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";

/**
 * Three auth-aware CTA clusters used on the landing page. They all share the
 * same source-of-truth (`useAuth()`); only the styling changes per location.
 *
 * Behaviour:
 * - While the `/me` query is in-flight on first paint, we render the visitor
 *   CTAs (the common case) to avoid a layout placeholder.
 * - On confirmed-authenticated, we collapse to a single "Open app" link.
 */

const headerSignInCls =
  "rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary min-h-11 min-w-11 inline-flex items-center justify-center sm:min-w-0";
const headerPrimaryCls =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-[#0B0F13] shadow-sm shadow-accent/20 transition-colors duration-200 hover:bg-accent-hover";

const heroPrimaryCls =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-8 text-base font-semibold text-[#0B0F13] shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30";
const heroSecondaryCls =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-border-strong bg-bg-surface px-8 text-base font-semibold text-text-primary transition-colors duration-200 hover:border-accent/40 hover:bg-bg-elevated";

const finalPrimaryCls =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl bg-accent px-6 text-center text-sm font-semibold text-[#0B0F13] transition-colors hover:bg-accent-hover sm:w-auto sm:min-w-[11rem]";
const finalSecondaryCls =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl border border-border-strong px-6 text-center text-sm font-semibold text-text-primary transition-colors hover:bg-bg-surface sm:w-auto sm:min-w-[11rem]";

export function HeaderAuthCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Link href="/app" className={headerPrimaryCls}>
        Open app
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className={headerSignInCls}>
        Sign in
      </Link>
      <Link href="/register" className={headerPrimaryCls}>
        Get started
      </Link>
    </>
  );
}

export function HeroAuthCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Link href="/app" className={heroPrimaryCls}>
        Open your workspace
      </Link>
    );
  }

  return (
    <>
      <Link href="/register" className={heroPrimaryCls}>
        Get started free
      </Link>
      <Link href="/login" className={heroSecondaryCls}>
        Sign in
      </Link>
    </>
  );
}

export function FinalAuthCTA() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Link href="/app" className={finalPrimaryCls}>
        Open your workspace
      </Link>
    );
  }

  return (
    <>
      <Link href="/register" className={finalPrimaryCls}>
        Create account
      </Link>
      <Link href="/login" className={finalSecondaryCls}>
        Sign in
      </Link>
    </>
  );
}
