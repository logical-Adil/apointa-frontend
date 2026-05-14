import type { BookingExtract, BookingField, Message } from "./types";

const BOOKING_KEYWORDS = [
  "book",
  "schedule",
  "appointment",
  "meeting",
  "call",
  "session",
  "reschedule",
  "slot",
  "consult",
];

const TIME_HINTS = /\b(\d{1,2})(:\d{2})?\s*(am|pm)?\b/i;
const DAY_HINTS = /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|this week)/i;
const DURATION_HINTS = /(\d{1,3})\s*(min|minute|hour|hr)s?\b/i;

function detectBooking(input: string): BookingExtract | null {
  const lower = input.toLowerCase();
  const triggers = BOOKING_KEYWORDS.some((k) => lower.includes(k));
  if (!triggers) return null;

  const duration = lower.match(DURATION_HINTS);
  const time = lower.match(TIME_HINTS);
  const day = lower.match(DAY_HINTS);

  const extract: BookingExtract = {
    service: lower.includes("design")
      ? "Design session"
      : lower.includes("dentist")
        ? "Dental check-up"
        : lower.includes("interview")
          ? "Interview"
          : lower.includes("review")
            ? "Review meeting"
            : "Appointment",
    date: day ? humanizeDayHint(day[0]) : undefined,
    time: time ? humanizeTime(time[0]) : undefined,
    duration: duration ? `${duration[1]} ${duration[2].startsWith("hour") || duration[2] === "hr" ? "hr" : "min"}` : undefined,
    missingFields: [],
  };

  if (!extract.date) extract.missingFields.push("date");
  if (!extract.time) extract.missingFields.push("time");
  if (!extract.duration) extract.missingFields.push("duration");

  return extract;
}

function humanizeDayHint(raw: string): string {
  const v = raw.toLowerCase();
  if (v === "today") return "Today";
  if (v === "tomorrow") return "Tomorrow";
  if (v === "next week") return "Next week";
  if (v === "this week") return "This week";
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function humanizeTime(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function missingFieldLabels(missing: BookingField[]): string {
  const map: Record<BookingField, string> = {
    service: "appointment type",
    date: "date",
    time: "time",
    duration: "duration",
    notes: "notes",
  };
  return missing.map((m) => map[m]).join(", ");
}

export function generateAssistantReply(
  userInput: string,
  conversation: Message[],
): Message {
  const booking = detectBooking(userInput);
  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  if (booking) {
    const missing = booking.missingFields;
    const friendlyMissing = missing.length
      ? `I still need ${missingFieldLabels(missing)} to confirm. You can answer here or open the booking form.`
      : "Looks like I have everything I need — please confirm to book.";

    return {
      id,
      role: "assistant",
      content: `Got it. ${friendlyMissing}`,
      createdAt,
      status: "sent",
      booking,
    };
  }

  const fallbacks = [
    "Tell me when you'd like to book and any details (appointment type, duration, notes). I can also reschedule existing appointments.",
    "I can help with bookings, rescheduling, and cancellations. Try something like 'Book a 30 min call tomorrow at 2 PM.'",
    "Got it. If this turns into an appointment request, just let me know the time and I'll extract the details for you.",
  ];
  const index = conversation.filter((m) => m.role === "assistant").length % fallbacks.length;
  return {
    id,
    role: "assistant",
    content: fallbacks[index],
    createdAt,
    status: "sent",
  };
}
