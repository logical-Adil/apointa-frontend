import type {
  Appointment,
  AppointmentStatus,
  AppointmentTab,
} from "@/lib/app/types";

export type { Appointment, AppointmentStatus, AppointmentTab };

export type AppointmentListFilters = {
  tab?: AppointmentTab;
  from?: string;
  to?: string;
};

export type AppointmentListResponse = {
  items: Appointment[];
  total: number;
};

export type CreateAppointmentInput = {
  /** Calendar title (main line on the card). */
  title: string;
  /** Appointment type (kind of visit). */
  service: string;
  startAt: string;
  durationMin: number;
  notes?: string;
};

export type UpdateAppointmentStatusInput = {
  id: string;
  status: AppointmentStatus;
};
