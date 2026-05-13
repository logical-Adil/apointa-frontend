export * from "./appointments.types";
export * as appointmentsApi from "./appointments.api";
export {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
} from "./appointments.hooks";
