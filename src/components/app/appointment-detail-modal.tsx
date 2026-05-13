"use client";

import { useEffect, useId, useRef } from "react";
import type { Appointment, AppointmentStatus } from "@/lib/app/types";

type AppointmentDetailModalProps = {
  appointment: Appointment | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
};

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; cls: string; dot: string }
> = {
  pending: {
    label: "Pending",
    cls: "bg-warning/10 text-warning ring-warning/25",
    dot: "bg-warning",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-success/10 text-success ring-success/25",
    dot: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-danger/10 text-danger ring-danger/25",
    dot: "bg-danger",
  },
};

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function endTime(iso: string, durationMin: number) {
  const end = new Date(new Date(iso).getTime() + durationMin * 60_000);
  return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function AppointmentDetailModal({
  appointment,
  onClose,
  onUpdateStatus,
}: AppointmentDetailModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!appointment) return;
    const t = window.setTimeout(() => firstActionRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [appointment]);

  useEffect(() => {
    if (!appointment) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [appointment, onClose]);

  if (!appointment) return null;

  const status = STATUS_META[appointment.status];
  const canConfirm = appointment.status !== "confirmed";
  const canCancel = appointment.status !== "cancelled";
  const canRestore = appointment.status === "cancelled";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-6 sm:px-6 sm:py-8"
    >
      <button
        type="button"
        aria-label="Close appointment details"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px] animate-fade-in"
      />

      <div
        ref={panelRef}
        className="relative flex max-h-[min(90dvh,44rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40 animate-scale-in"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              {appointment.service}
            </p>
            <h2
              id={titleId}
              className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary"
            >
              {appointment.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${status.cls}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} aria-hidden />
              {status.label}
            </span>
            <span className="font-mono text-[11px] text-text-muted">
              {appointment.durationMin} min
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border-subtle bg-bg-base/60 px-4 py-3 text-xs">
            <div className="col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Date
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-text-primary">
                {formatLongDate(appointment.startAt)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Starts
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-text-primary">
                {formatTime(appointment.startAt)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Ends
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-text-primary">
                {endTime(appointment.startAt, appointment.durationMin)}
              </dd>
            </div>
          </dl>

          {appointment.notes ? (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {appointment.notes}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border-subtle bg-bg-surface/60 px-4 py-3 sm:px-5">
          {canRestore ? (
            <button
              ref={firstActionRef}
              type="button"
              onClick={() => onUpdateStatus(appointment.id, "pending")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              Restore
            </button>
          ) : null}

          {canCancel ? (
            <button
              ref={canRestore ? undefined : firstActionRef}
              type="button"
              onClick={() => onUpdateStatus(appointment.id, "cancelled")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger/15"
            >
              Cancel appointment
            </button>
          ) : null}

          {canConfirm && !canRestore ? (
            <button
              type="button"
              onClick={() => onUpdateStatus(appointment.id, "confirmed")}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-[#0B0F13] shadow-sm shadow-accent/20 transition-colors hover:bg-accent-hover"
            >
              <CheckIcon />
              Confirm
            </button>
          ) : null}

          {!canCancel && !canConfirm && !canRestore ? (
            <button
              ref={firstActionRef}
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              Close
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
