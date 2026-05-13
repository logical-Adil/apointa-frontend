"use client";

import { useMemo, useState } from "react";
import { APPOINTMENT_STATUS_META } from "@/lib/app/appointment-status";
import {
  formatShortDate,
  formatTime,
  relativeFromNow,
} from "@/lib/app/date-format";
import type { Appointment, AppointmentTab } from "@/lib/app/types";

type AppointmentsPanelProps = {
  appointments: Appointment[];
  onNewAppointment?: () => void;
  onSelectAppointment?: (appointment: Appointment) => void;
};

const TAB_DEFS: { id: AppointmentTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export function AppointmentsPanel({
  appointments,
  onNewAppointment,
  onSelectAppointment,
}: AppointmentsPanelProps) {
  const [tab, setTab] = useState<AppointmentTab>("upcoming");

  const counts = useMemo(() => {
    const now = Date.now();
    const upcoming = appointments.filter(
      (a) => new Date(a.startAt).getTime() >= now && a.status !== "cancelled",
    ).length;
    const past = appointments.filter(
      (a) => new Date(a.startAt).getTime() < now || a.status === "cancelled",
    ).length;
    return { upcoming, past, all: appointments.length };
  }, [appointments]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const list = [...appointments].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );
    if (tab === "all") return list;
    if (tab === "upcoming") {
      return list.filter(
        (a) => new Date(a.startAt).getTime() >= now && a.status !== "cancelled",
      );
    }
    return list
      .filter((a) => new Date(a.startAt).getTime() < now || a.status === "cancelled")
      .reverse();
  }, [appointments, tab]);

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-border-subtle bg-bg-surface animate-slide-in-right animation-delay-1 lg:border-l">
      <div className="border-b border-border-subtle bg-bg-surface/85 px-3 py-3 backdrop-blur-md sm:px-5">
        <div className="flex flex-col gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              Appointments
            </p>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight text-text-primary sm:text-lg">
              Your schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={onNewAppointment}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-semibold text-[#0B0F13] shadow-sm shadow-accent/20 transition-colors hover:bg-accent-hover sm:text-[13px]"
          >
            <PlusIcon />
            New appointment
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1 rounded-xl bg-bg-base p-1" role="tablist">
          {TAB_DEFS.map((t) => {
            const active = tab === t.id;
            const count =
              t.id === "upcoming" ? counts.upcoming : t.id === "past" ? counts.past : counts.all;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                  active
                    ? "bg-accent-soft text-accent ring-1 ring-accent/30"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
                <span
                  className={`inline-flex min-w-[1.75rem] justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                    active ? "bg-accent/15 text-accent" : "bg-bg-surface text-text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="appointa-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3 pr-1.5 sm:px-4 sm:pr-2">
        {filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <ol className="flex flex-col gap-2.5">
            {filtered.map((appointment) => (
              <li key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onSelect={onSelectAppointment}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function AppointmentCard({
  appointment,
  onSelect,
}: {
  appointment: Appointment;
  onSelect?: (appointment: Appointment) => void;
}) {
  const status = APPOINTMENT_STATUS_META[appointment.status];
  const dimmed = appointment.status === "cancelled";
  const interactive = Boolean(onSelect);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {appointment.service}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold text-text-primary">
            {appointment.title}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.cls}`}
        >
          <span className={`size-1 rounded-full ${status.dot}`} aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon />
            {formatShortDate(appointment.startAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            {formatTime(appointment.startAt)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-muted">
          {appointment.durationMin}m · {relativeFromNow(appointment.startAt)}
        </span>
      </div>

      {appointment.notes ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
          {appointment.notes}
        </p>
      ) : null}
    </>
  );

  const baseCls = `group relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-4 text-left transition-all duration-200 hover:border-border-strong ${
    dimmed ? "opacity-70" : ""
  } ${interactive ? "hover:bg-bg-surface" : ""}`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(appointment)}
        aria-label={`View ${appointment.title}`}
        className={baseCls}
      >
        {content}
      </button>
    );
  }

  return <article className={baseCls}>{content}</article>;
}

function EmptyState({ tab }: { tab: AppointmentTab }) {
  const copy =
    tab === "upcoming"
      ? {
          title: "Nothing on the calendar.",
          body: "Ask Appointa for a time, or tap New appointment above to start a booking.",
        }
      : tab === "past"
        ? {
            title: "No past appointments.",
            body: "Once you complete or cancel an appointment it'll show up here.",
          }
        : {
            title: "It's all clear.",
            body: "Use the chat to book a session — Appointa handles the rest.",
          };
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft ring-1 ring-accent/20">
        <CalendarIcon className="size-5 text-accent" />
      </div>
      <h3 className="mt-4 w-full max-w-[16rem] text-sm font-semibold text-text-primary">
        {copy.title}
      </h3>
      <p className="mt-1.5 w-full max-w-[16rem] text-xs leading-relaxed text-text-secondary">
        {copy.body}
      </p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CalendarIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 18.75V7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v11.25m-16.5 0A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25m-16.5 0h16.5M3.75 11.25h16.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
