import { api } from '@/lib/api/client';
import type { ChatMessagesResponse, ChatSession, ChatSessionListResponse, CreateSessionInput, SendMessageInput, SendMessageResponse } from './chat.types';

const BASE = '/v1/chat';

/** GET /v1/chat/sessions */
export function listSessions(): Promise<ChatSessionListResponse> {
  return api.get<ChatSessionListResponse>(`${BASE}/sessions`);
}

/** POST /v1/chat/sessions */
export function createSession(input?: CreateSessionInput): Promise<ChatSession> {
  return api.post<ChatSession>(`${BASE}/sessions`, input ?? {});
}

/** GET /v1/chat/sessions/:id/messages */
export function getMessages(sessionId: string): Promise<ChatMessagesResponse> {
  return api.get<ChatMessagesResponse>(`${BASE}/sessions/${encodeURIComponent(sessionId)}/messages`);
}

/** POST /v1/chat/messages */
export function sendMessage(input: SendMessageInput): Promise<SendMessageResponse> {
  return api.post<SendMessageResponse>(`${BASE}/messages`, input);
}
