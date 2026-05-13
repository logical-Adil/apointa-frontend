"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogout } from "@/features/auth";
import type { CurrentUser } from "@/lib/app/types";

type UserMenuProps = {
  user: CurrentUser;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const logoutMutation = useLogout();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    setOpen(false);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Cookie is cleared client-side regardless; nothing else to do.
    }
    router.replace("/login");
  }

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="inline-flex size-11 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-border-strong hover:bg-bg-elevated"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent ring-1 ring-accent/25">
          {initials(user.name)}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-xl shadow-black/30 animate-fade-in"
        >
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              Signed in
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              {user.name}
            </p>
            <p className="truncate font-mono text-xs text-text-muted">
              {user.email}
            </p>
          </div>
          <div className="flex flex-col py-1">
            <button
              type="button"
              role="menuitem"
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSignOut}
            >
              <IconExit />
              {logoutMutation.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconExit() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l3-3m-3 3l3 3M9 4.5h7.5A2.25 2.25 0 0118.75 6.75v10.5A2.25 2.25 0 0116.5 19.5H9" />
    </svg>
  );
}
