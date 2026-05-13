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
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] items-center gap-2 px-3 sm:h-[4.5rem] sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="min-w-0 shrink rounded-xl outline-offset-4"
          aria-label="Appointa home"
        >
          <AppointaLogo priority className="min-w-0" />
        </Link>

        <div
          className="flex min-w-0 justify-center gap-1.5 sm:gap-2 lg:hidden"
          role="tablist"
          aria-label="App views"
        >
          <PillTab
            active={view === "chat"}
            onClick={() => onViewChange("chat")}
            label="Chat"
          />
          <PillTab
            active={view === "appointments"}
            onClick={() => onViewChange("appointments")}
            label="Appointments"
            shortLabel="Appts"
            badge={appointmentsCount}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
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
  shortLabel,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  /** Narrow screens (shown with full label in aria-label). */
  shortLabel?: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={shortLabel ? label : undefined}
      onClick={onClick}
      className={`relative inline-flex h-9 max-w-full min-w-0 items-center gap-1 rounded-lg px-2.5 text-[11px] font-semibold transition-colors duration-200 sm:gap-1.5 sm:px-3 sm:text-xs ${
        active
          ? "bg-accent-soft text-accent ring-1 ring-accent/30"
          : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
      }`}
    >
      {shortLabel ? (
        <>
          <span className="truncate sm:hidden">{shortLabel}</span>
          <span className="hidden truncate sm:inline">{label}</span>
        </>
      ) : (
        <span className="truncate">{label}</span>
      )}
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
