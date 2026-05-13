import { addDays, format, isValid, parse, startOfDay } from "date-fns";

const ISO_YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Next calendar occurrence of `targetDow` (0=Sun … 6=Sat), including today if it matches. */
function upcomingCalendarDay(ref: Date, targetDow: number): Date {
  const base = startOfDay(ref);
  const cur = base.getDay();
  let add = (targetDow - cur + 7) % 7;
  if (add === 0) return base;
  return addDays(base, add);
}

/**
 * Map AI / human date strings to `yyyy-MM-dd` for the booking drawer.
 * Returns "" when nothing reliable can be inferred.
 */
export function parseBookingDateToYmd(raw: string | undefined | null, ref = new Date()): string {
  if (!raw?.trim()) return "";
  const s = raw.trim();

  if (ISO_YMD.test(s)) return s;

  const lower = s.toLowerCase();
  const base = startOfDay(ref);

  if (/^today$/i.test(lower)) return format(base, "yyyy-MM-dd");
  if (/^tomorrow$/i.test(lower)) return format(addDays(base, 1), "yyyy-MM-dd");

  const nextWeek = /\bnext\s+week\b/i.test(s);

  const pairs: [RegExp, number][] = [
    [/\b(sun|sunday)\b/i, 0],
    [/\b(mon|monday)\b/i, 1],
    [/\b(tue|tues|tuesday)\b/i, 2],
    [/\b(wed|wednesday)\b/i, 3],
    [/\b(thu|thur|thurs|thursday)\b/i, 4],
    [/\b(fri|friday)\b/i, 5],
    [/\b(sat|saturday)\b/i, 6],
  ];

  for (const [re, dow] of pairs) {
    if (re.test(s)) {
      let d = upcomingCalendarDay(ref, dow);
      if (nextWeek) d = addDays(d, 7);
      return format(d, "yyyy-MM-dd");
    }
  }

  const patterns = [
    "MMM d, yyyy",
    "MMMM d, yyyy",
    "MMM d yyyy",
    "MMMM d yyyy",
    "d MMM yyyy",
    "d MMMM yyyy",
    "MMM d",
    "MMMM d",
    "d MMM",
    "d MMMM",
  ];
  for (const p of patterns) {
    const d = parse(s, p, ref);
    if (isValid(d)) return format(startOfDay(d), "yyyy-MM-dd");
  }

  return "";
}

/** Snap to nearest allowed duration (minutes). */
export function snapDurationMinutes(
  minutes: number,
  allowed: readonly number[],
): number {
  const n = Math.round(minutes);
  if (!Number.isFinite(n) || allowed.length === 0) return allowed[0] ?? 30;
  const lo = Math.min(...allowed);
  const hi = Math.max(...allowed);
  const clamped = Math.max(lo, Math.min(hi, n));
  let best = allowed[0]!;
  let bestDist = Infinity;
  for (const a of allowed) {
    const dist = Math.abs(a - clamped);
    if (dist < bestDist) {
      bestDist = dist;
      best = a;
    }
  }
  return best;
}
