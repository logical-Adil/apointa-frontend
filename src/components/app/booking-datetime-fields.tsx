"use client";

import { format, isValid, parse, startOfDay } from "date-fns";
import { useMemo, type CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export type BookingDateTimeFieldsProps = {
  date: string;
  time: string;
  onDateChange: (isoDate: string) => void;
  onTimeChange: (hhmm: string) => void;
  errors: { date?: string; time?: string };
  idPrefix: string;
};

function parseYmdLocal(ymd: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function formatYmdLocal(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Build 15-minute slots from 7:00 through 21:45. */
function buildTimeSlots(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 21 && m > 45) break;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const ref = new Date(2020, 0, 1, h, m, 0, 0);
      out.push({ value, label: format(ref, "h:mm a") });
    }
  }
  return out;
}

function isTodayYmd(ymd: string): boolean {
  return ymd === format(new Date(), "yyyy-MM-dd");
}

function isSlotInPast(ymd: string, slotValue: string): boolean {
  if (!isTodayYmd(ymd)) return false;
  const [hh, mm] = slotValue.split(":").map(Number);
  const slot = new Date();
  slot.setHours(hh, mm, 0, 0);
  return slot.getTime() <= Date.now();
}

export function parseLooseTime(input?: string): string {
  if (!input?.trim()) return "";
  let t = input.trim();
  const before = t.match(/^before\s+(.+)$/i);
  if (before) t = before[1].trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const ref = new Date();
  const patterns = ["h:mm a", "h:mma", "ha", "h a", "HH:mm", "H:mm"];
  for (const p of patterns) {
    const d = parse(t, p, ref);
    if (isValid(d)) return format(d, "HH:mm");
  }
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (m) {
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ap = m[3]?.toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
  }
  return "";
}

const TIME_SLOTS = buildTimeSlots();

export function nearestSlotValue(hhmm: string): string {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const target = h * 60 + m;
  let best = TIME_SLOTS[0]!.value;
  let bestDist = Infinity;
  for (const s of TIME_SLOTS) {
    const [sh, sm] = s.value.split(":").map(Number);
    const t = sh * 60 + sm;
    const d = Math.abs(t - target);
    if (d < bestDist) {
      bestDist = d;
      best = s.value;
    }
  }
  return best;
}

export function BookingDateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  errors,
  idPrefix,
}: BookingDateTimeFieldsProps) {
  const selected = parseYmdLocal(date);
  const today = startOfDay(new Date());
  const endNav = new Date(today.getFullYear() + 2, 11, 31);

  const rdpVars = useMemo(
    () =>
      ({
        "--rdp-accent-color": "var(--accent)",
        "--rdp-accent-background-color": "var(--accent-soft)",
        "--rdp-day-height": "2.25rem",
        "--rdp-day-width": "2.25rem",
        "--rdp-day_button-border-radius": "0.5rem",
        "--rdp-day_button-height": "2.125rem",
        "--rdp-day_button-width": "2.125rem",
        "--rdp-nav-height": "2.5rem",
        "--rdp-weekday-opacity": "0.85",
        "--rdp-outside-opacity": "0.45",
      }) as CSSProperties,
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          id={`${idPrefix}-date-label`}
          htmlFor={`${idPrefix}-date`}
          className="text-sm font-medium text-text-primary"
        >
          Date<span aria-hidden className="ml-0.5 text-text-muted">*</span>
        </label>
        <div
          id={`${idPrefix}-date`}
          role="group"
          aria-labelledby={`${idPrefix}-date-label`}
          style={rdpVars}
          className="rounded-2xl border border-border-subtle bg-bg-elevated p-3 shadow-sm [&_.rdp-root]:w-full [&_.rdp-months]:justify-center [&_.rdp-dropdown]:rounded-lg [&_.rdp-dropdown]:border [&_.rdp-dropdown]:border-border-subtle [&_.rdp-dropdown]:bg-bg-surface [&_.rdp-dropdown]:px-2 [&_.rdp-dropdown]:py-1.5 [&_.rdp-dropdown]:text-sm [&_.rdp-dropdown]:text-text-primary [&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-semibold [&_.rdp-caption_label]:text-text-primary [&_.rdp-weekday]:text-[11px] [&_.rdp-weekday]:font-medium [&_.rdp-weekday]:uppercase [&_.rdp-weekday]:tracking-wider [&_.rdp-button_next]:rounded-lg [&_.rdp-button_next]:border [&_.rdp-button_next]:border-border-subtle [&_.rdp-button_next]:bg-bg-surface [&_.rdp-button_previous]:rounded-lg [&_.rdp-button_previous]:border [&_.rdp-button_previous]:border-border-subtle [&_.rdp-button_previous]:bg-bg-surface [&_.rdp-day_button]:text-sm [&_.rdp-day_button]:font-medium [&_.rdp-day_button]:text-text-primary [&_.rdp-day]:text-text-secondary"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(d) => {
              const ymd = d ? formatYmdLocal(d) : "";
              onDateChange(ymd);
              if (ymd && time && isSlotInPast(ymd, time)) {
                onTimeChange("");
              }
            }}
            disabled={{ before: today }}
            defaultMonth={selected ?? today}
            startMonth={today}
            endMonth={endNav}
            captionLayout="dropdown"
            weekStartsOn={1}
            aria-label="Choose appointment date"
          />
        </div>
        {errors.date ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.date}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <p
          id={`${idPrefix}-time-label`}
          className="text-sm font-medium text-text-primary"
        >
          Time<span aria-hidden className="ml-0.5 text-text-muted">*</span>
        </p>
        <div
          role="listbox"
          aria-labelledby={`${idPrefix}-time-label`}
          aria-invalid={Boolean(errors.time)}
          className={`max-h-48 overflow-y-auto rounded-2xl border bg-bg-elevated p-2 shadow-sm ${
            errors.time
              ? "border-danger/70 ring-1 ring-danger/25"
              : "border-border-subtle"
          }`}
        >
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {TIME_SLOTS.map((slot) => {
              const disabled = !date || isSlotInPast(date, slot.value);
              const active = time === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => onTimeChange(slot.value)}
                  className={`inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-xs font-semibold transition-colors duration-150 ${
                    active
                      ? "bg-accent-soft text-accent ring-1 ring-accent/35"
                      : disabled
                        ? "cursor-not-allowed opacity-40"
                        : "border border-border-subtle bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-text-muted">
          15-minute slots, 7:00 a.m.–9:45 p.m. Times before now are disabled when
          today is selected.
        </p>
        {errors.time ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.time}
          </p>
        ) : null}
      </div>
    </div>
  );
}
