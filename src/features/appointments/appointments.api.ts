import { api } from "@/lib/api/client";
import type {
  Appointment,
  AppointmentListFilters,
  AppointmentListResponse,
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "./appointments.types";

const BASE = "/v1/appointments";

function buildQuery(filters?: AppointmentListFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.tab) params.set("tab", filters.tab);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** GET /v1/appointments?tab=... */
export function listAppointments(
  filters?: AppointmentListFilters,
): Promise<AppointmentListResponse> {
  return api.get<AppointmentListResponse>(`${BASE}${buildQuery(filters)}`);
}

/** GET /v1/appointments/:id */
export function getAppointment(id: string): Promise<Appointment> {
  return api.get<Appointment>(`${BASE}/${encodeURIComponent(id)}`);
}

/** POST /v1/appointments */
export function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  return api.post<Appointment>(BASE, input);
}

/** PATCH /v1/appointments/:id/status */
export function updateAppointmentStatus({
  id,
  status,
}: UpdateAppointmentStatusInput): Promise<Appointment> {
  return api.patch<Appointment>(
    `${BASE}/${encodeURIComponent(id)}/status`,
    { status },
  );
}

/** DELETE /v1/appointments/:id */
export function deleteAppointment(id: string): Promise<void> {
  return api.delete<void>(`${BASE}/${encodeURIComponent(id)}`);
}
