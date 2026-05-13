/**
 * Date / time formatters used across the workspace UI (message bubbles,
 * appointment cards, modals). Centralised so all surfaces look identical.
 */

/** "9:30 AM" style time. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "Mon, Jan 5" — used for compact list rows. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Monday, January 5, 2025" — used in modal headers / detail views. */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Adds `durationMin` to `iso` and returns the formatted end time. */
export function formatEndTime(iso: string, durationMin: number): string {
  const end = new Date(new Date(iso).getTime() + durationMin * 60_000);
  return end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Compact "in 2h" / "3d ago" style relative time. */
export function relativeFromNow(iso: string): string {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  const minutes = Math.round(diff / (60 * 1000));
  const abs = Math.abs(minutes);
  const future = diff >= 0;

  if (abs < 60) return future ? "in <1h" : "just now";
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24)
    return future ? `in ${hours}h` : `${Math.abs(hours)}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7)
    return future ? `in ${days}d` : `${Math.abs(days)}d ago`;
  const weeks = Math.round(days / 7);
  return future ? `in ${weeks}w` : `${Math.abs(weeks)}w ago`;
}
