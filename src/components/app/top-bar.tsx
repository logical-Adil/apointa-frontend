"use client";

import Link from "next/link";
import { AppointaLogo } from "@/components/appointa-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/app/user-menu";
import type { AppViewMode, CurrentUser } from "@/lib/app/types";

type TopBarProps = {
  user: CurrentUser;
  view: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  appointmentsCount: number;
};

export function TopBar({ user, view, onViewChange, appointmentsCount }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link href="/" className="rounded-xl outline-offset-4" aria-label="Appointa home">
          <AppointaLogo priority />
        </Link>

        <div className="flex items-center gap-2 md:hidden" role="tablist" aria-label="App views">
          <PillTab
            active={view === "chat"}
            onClick={() => onViewChange("chat")}
            label="Chat"
          />
          <PillTab
            active={view === "appointments"}
            onClick={() => onViewChange("appointments")}
            label="Appointments"
            badge={appointmentsCount}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

function PillTab({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors duration-200 ${
        active
          ? "bg-accent-soft text-accent ring-1 ring-accent/30"
          : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span
          className={`ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            active ? "bg-accent/15 text-accent" : "bg-bg-surface text-text-muted"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
