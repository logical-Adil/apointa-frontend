"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import * as apptsApi from "./appointments.api";
import type {
  Appointment,
  AppointmentListFilters,
  AppointmentListResponse,
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "./appointments.types";

export function useAppointments(
  filters?: AppointmentListFilters,
  options?: { enabled?: boolean },
) {
  return useQuery<AppointmentListResponse>({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => apptsApi.listAppointments(filters),
    enabled: options?.enabled ?? true,
    staleTime: 3 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useAppointment(
  id: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<Appointment>({
    queryKey: queryKeys.appointments.detail(id ?? "__none__"),
    queryFn: () => apptsApi.getAppointment(id as string),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 3 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, unknown, CreateAppointmentInput>({
    mutationFn: apptsApi.createAppointment,
    onSuccess: (appointment) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.setQueryData(queryKeys.appointments.detail(appointment.id), appointment);
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation<Appointment, unknown, UpdateAppointmentStatusInput>({
    mutationFn: apptsApi.updateAppointmentStatus,
    onSuccess: (appointment) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.setQueryData(queryKeys.appointments.detail(appointment.id), appointment);
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation<void, unknown, string>({
    mutationFn: apptsApi.deleteAppointment,
    onSuccess: (_void, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      qc.removeQueries({ queryKey: queryKeys.appointments.detail(id) });
    },
  });
}
