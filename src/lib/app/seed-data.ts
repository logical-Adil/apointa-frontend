import type {
  Appointment,
  CurrentUser,
  Message,
} from "./types";

function shiftDate(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const seedUser: CurrentUser = {
  name: "Adil Khan",
  email: "adil@appointa.app",
};

export const seedMessages: Message[] = [
  {
    id: "m-1",
    role: "assistant",
    content:
      "Hi Adil. I can help you book, reschedule, or review appointments. Tell me what you need in plain language.",
    createdAt: shiftDate(0, 9, 12),
    status: "sent",
  },
  {
    id: "m-2",
    role: "user",
    content: "Book a 30-minute discovery call with the design team next Tuesday morning.",
    createdAt: shiftDate(0, 9, 14),
    status: "sent",
  },
  {
    id: "m-3",
    role: "assistant",
    content:
      "Got it. I have availability at 9:00 AM or 10:30 AM next Tuesday. Which works better?",
    createdAt: shiftDate(0, 9, 15),
    status: "sent",
    booking: {
      service: "Discovery call",
      date: "Tue · next week",
      time: "Before 11:00 AM",
      duration: "30 min",
      missingFields: ["time"],
    },
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: "ap-1",
    title: "Discovery call with design team",
    service: "Discovery call",
    startAt: shiftDate(1, 14, 0),
    durationMin: 30,
    status: "confirmed",
    notes: "Discuss new onboarding flow.",
  },
  {
    id: "ap-2",
    title: "Quarterly review",
    service: "Internal sync",
    startAt: shiftDate(3, 10, 30),
    durationMin: 60,
    status: "pending",
  },
  {
    id: "ap-3",
    title: "Customer interview · Acme Co.",
    service: "Customer call",
    startAt: shiftDate(6, 16, 0),
    durationMin: 45,
    status: "confirmed",
  },
  {
    id: "ap-4",
    title: "Dentist follow-up",
    service: "Personal",
    startAt: shiftDate(-2, 11, 0),
    durationMin: 30,
    status: "confirmed",
  },
  {
    id: "ap-5",
    title: "Project kickoff",
    service: "Internal sync",
    startAt: shiftDate(-7, 13, 0),
    durationMin: 60,
    status: "cancelled",
    notes: "Replaced by async update.",
  },
];
