import type { BookingExtract, Message } from "@/lib/app/types";

export type { BookingExtract, Message };

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
};

export type ChatSessionListResponse = {
  items: ChatSession[];
};

export type ChatMessagesResponse = {
  sessionId: string;
  items: Message[];
  /** Server may include the latest booking extract here so the UI doesn't recompute. */
  booking?: BookingExtract | null;
};

export type SendMessageInput = {
  sessionId?: string;
  content: string;
};

export type SendMessageResponse = {
  sessionId: string;
  userMessage: Message;
  assistantMessage: Message;
  booking?: BookingExtract | null;
};

export type CreateSessionInput = {
  title?: string;
  /** Optional first user message to seed the session. */
  initialMessage?: string;
};
