import type { AppointmentStatus } from "@/lib/app/types";

/**
 * Visual metadata for an appointment status pill.
 * Shared between the appointments list, the detail modal, and any future
 * surface that needs to render a status badge.
 */
export type AppointmentStatusMeta = {
  label: string;
  /** Background + text + ring classes for the pill container. */
  cls: string;
  /** Background class for the leading dot. */
  dot: string;
};

export const APPOINTMENT_STATUS_META: Record<
  AppointmentStatus,
  AppointmentStatusMeta
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

export function getAppointmentStatusMeta(
  status: AppointmentStatus,
): AppointmentStatusMeta {
  return APPOINTMENT_STATUS_META[status];
}
