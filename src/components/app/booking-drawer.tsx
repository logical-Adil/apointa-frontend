"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Appointment, BookingExtract } from "@/lib/app/types";
import {
  BookingDateTimeFields,
  nearestSlotValue,
  parseLooseTime,
} from "@/components/app/booking-datetime-fields";

type BookingDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Optional pre-fill from an AI-extracted booking. */
  initial?: BookingExtract | null;
  onSubmit: (appointment: Appointment) => void;
};

type DraftErrors = Partial<
  Record<"service" | "date" | "time" | "duration", string>
>;

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function parseExtractToInputs(initial?: BookingExtract | null) {
  const out = { date: "", time: "", duration: 30 };
  if (!initial) return out;

  if (initial.date && /^\d{4}-\d{2}-\d{2}$/.test(initial.date)) {
    out.date = initial.date;
  }
  const loose = parseLooseTime(initial.time);
  out.time = loose ? nearestSlotValue(loose) : "";
  if (initial.duration) {
    const m = initial.duration.match(/(\d{1,3})/);
    if (m) {
      const n = Number(m[1]);
      if (n >= 5 && n <= 600) out.duration = n;
    }
  }
  return out;
}

export function BookingDrawer({
  open,
  onClose,
  initial,
  onSubmit,
}: BookingDrawerProps) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<DraftErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const parsed = parseExtractToInputs(initial);
    setTitle("");
    setService(initial?.service ?? "");
    setDate(parsed.date);
    setTime(parsed.time);
    setDuration(parsed.duration);
    setNotes(initial?.notes ?? "");
    setErrors({});
    setSubmitting(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        // Lightweight focus trap.
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
  }, [open, onClose]);

  if (!open) return null;

  function validate(): DraftErrors {
    const next: DraftErrors = {};
    if (!service.trim()) next.service = "Service is required.";
    if (!date) next.date = "Pick a date.";
    if (!time) next.time = "Pick a time.";
    if (!duration || duration < 5) next.duration = "At least 5 minutes.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    // Mock network delay so the action feels real.
    await new Promise((resolve) => setTimeout(resolve, 450));

    const startAt = new Date(`${date}T${time}:00`).toISOString();
    const appointment: Appointment = {
      id: `ap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim() || service.trim(),
      service: service.trim(),
      startAt,
      durationMin: duration,
      status: "pending",
      notes: notes.trim() || undefined,
    };
    onSubmit(appointment);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close booking form"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px] animate-fade-in"
      />

      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden border-l border-border-strong bg-bg-base shadow-2xl shadow-black/40 animate-slide-in-right sm:w-[28rem]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border-subtle bg-bg-surface/70 px-5 py-4 backdrop-blur-md">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              New booking
            </p>
            <h2
              id={titleId}
              className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary"
            >
              Schedule an appointment
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

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-4">
              <Field label="Service" htmlForId={`${titleId}-service`} error={errors.service} required>
                <input
                  ref={firstFieldRef}
                  id={`${titleId}-service`}
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="Discovery call"
                  autoComplete="off"
                  className={inputCls(Boolean(errors.service))}
                  aria-invalid={Boolean(errors.service)}
                />
              </Field>

              <Field
                label="Title"
                htmlForId={`${titleId}-title`}
                hint="Optional — shown on the appointment card."
              >
                <input
                  id={`${titleId}-title`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Discovery call with design team"
                  autoComplete="off"
                  className={inputCls(false)}
                />
              </Field>

              <BookingDateTimeFields
                idPrefix={`${titleId}-dt`}
                date={date}
                time={time}
                onDateChange={setDate}
                onTimeChange={setTime}
                errors={{ date: errors.date, time: errors.time }}
              />

              <Field
                label="Duration"
                error={errors.duration}
                required
              >
                <div
                  role="radiogroup"
                  aria-label="Duration in minutes"
                  className="flex flex-wrap gap-1.5"
                >
                  {DURATION_OPTIONS.map((mins) => {
                    const active = duration === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setDuration(mins)}
                        className={`inline-flex h-9 items-center rounded-lg px-3 text-xs font-semibold transition-colors duration-150 ${
                          active
                            ? "bg-accent-soft text-accent ring-1 ring-accent/30"
                            : "border border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
                        }`}
                      >
                        {mins} min
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field
                label="Notes"
                htmlForId={`${titleId}-notes`}
                hint="Anything Appointa should keep in mind."
              >
                <textarea
                  id={`${titleId}-notes`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agenda, attendees, or context…"
                  className={`${inputCls(false)} resize-none`}
                />
              </Field>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-border-subtle bg-bg-surface/60 px-5 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 items-center rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-[#0B0F13] shadow-sm shadow-accent/20 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner /> Creating…
                </>
              ) : (
                "Create appointment"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `block w-full rounded-xl border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 outline-none focus:border-accent focus:bg-bg-elevated focus:ring-2 focus:ring-accent/30 ${
    hasError
      ? "border-danger/70 focus:border-danger focus:ring-danger/30"
      : "border-border-subtle hover:border-border-strong"
  }`;
}

function Field({
  label,
  htmlForId,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlForId?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlForId}
        className="text-sm font-medium text-text-primary"
      >
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-text-muted">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
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

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
