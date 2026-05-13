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
  title: string;
  service: string;
  startAt: string;
  durationMin: number;
  notes?: string;
};

export type UpdateAppointmentStatusInput = {
  id: string;
  status: AppointmentStatus;
};
