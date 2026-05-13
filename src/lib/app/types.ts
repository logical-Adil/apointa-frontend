export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "sending" | "sent" | "failed";

export type BookingExtract = {
  service?: string;
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
  title: string;
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
