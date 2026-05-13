import type { ConnectionStatus } from "@/lib/app/types";

const meta: Record<
  ConnectionStatus,
  { label: string; dot: string; text: string; bg: string; ring: string }
> = {
  connecting: {
    label: "Connecting",
    dot: "bg-warning animate-pulse",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/25",
  },
  connected: {
    label: "Connected",
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    ring: "ring-success/25",
  },
  reconnecting: {
    label: "Reconnecting",
    dot: "bg-warning animate-pulse",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/25",
  },
  offline: {
    label: "Offline",
    dot: "bg-danger",
    text: "text-danger",
    bg: "bg-danger/10",
    ring: "ring-danger/25",
  },
};

export function ConnectionPill({ status }: { status: ConnectionStatus }) {
  const m = meta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${m.bg} ${m.text} ${m.ring}`}
      role="status"
      aria-live="polite"
    >
      <span className={`size-1.5 rounded-full ${m.dot}`} aria-hidden />
      {m.label}
    </span>
  );
}
