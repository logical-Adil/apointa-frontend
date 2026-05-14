export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "sent" | "failed";

export type BookingExtract = {
  /** Appointment type (wire key `service`). */
  service?: string;
  /** Optional calendar headline (wire key `title`); same meaning as saved appointment `title`. */
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  notes?: string;
  missingFields: BookingField[];
};

export type BookingField = "service" | "date" | "time" | "duration" | "notes";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status?: MessageStatus;
  booking?: BookingExtract;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  /** Main line on the calendar card (optional in UI; required in API). */
  title: string;
  /** Kind of visit / category (API `service`). */
  service: string;
  startAt: string;
  durationMin: number;
  status: AppointmentStatus;
  notes?: string;
};

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "offline";

export type AppointmentTab = "upcoming" | "past" | "all";

export type AppViewMode = "chat" | "appointments";

export type CurrentUser = {
  name: string;
  email: string;
};
