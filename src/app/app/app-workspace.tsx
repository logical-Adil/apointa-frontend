"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppointmentDetailModal } from "@/components/app/appointment-detail-modal";
import { AppointmentsPanel } from "@/components/app/appointments-panel";
import { BookingDrawer } from "@/components/app/booking-drawer";
import { ChatPanel } from "@/components/app/chat-panel";
import { Toast } from "@/components/app/toast";
import { TopBar } from "@/components/app/top-bar";
import { SiteLoadingScreen } from "@/components/site-loading";
import { useAuth } from "@/features/auth";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
} from "@/features/appointments";
import type { CreateAppointmentInput } from "@/features/appointments/appointments.types";
import {
  useChatMessages,
  useChatSessions,
  useChatSocket,
  useSendMessage,
} from "@/features/chat";
import { getErrorMessage } from "@/lib/api/errors";
import { playNotificationTone } from "@/lib/sound/notification";
import type {
  AppViewMode,
  Appointment,
  AppointmentStatus,
  BookingExtract,
  ConnectionStatus,
  CurrentUser,
  Message,
} from "@/lib/app/types";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your Appointa concierge. Tell me what you'd like to book, reschedule, or review.",
  createdAt: new Date(0).toISOString(),
  status: "sent",
};

export function AppWorkspace() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(
    null,
  );
  const [view, setView] = useState<AppViewMode>("chat");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitial, setDrawerInitial] = useState<BookingExtract | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const didNavigateToLogin = useRef(false);

  const appointmentsQuery = useAppointments(undefined, {
    enabled: isAuthenticated,
  });
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();

  const appointments = appointmentsQuery.data?.items ?? [];

  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    if (didNavigateToLogin.current) return;
    didNavigateToLogin.current = true;
    router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  // --- Chat data ---------------------------------------------------------
  const sessionsQuery = useChatSessions({ enabled: isAuthenticated });
  const messagesQuery = useChatMessages(activeSessionId ?? undefined, {
    enabled: Boolean(activeSessionId) && isAuthenticated,
  });
  const sendMutation = useSendMessage();
  const socketStatus = useChatSocket(isAuthenticated);

  // Pick the most recently updated session as the active one when sessions load.
  useEffect(() => {
    if (!sessionsQuery.data || activeSessionId) return;
    const first = sessionsQuery.data.items[0];
    if (first) setActiveSessionId(first.id);
  }, [sessionsQuery.data, activeSessionId]);

  const connection: ConnectionStatus = useMemo(() => {
    if (!isAuthenticated) return "offline";
    if (socketStatus === "connecting") return "connecting";
    if (sessionsQuery.isError || messagesQuery.isError) return "reconnecting";
    if (socketStatus === "reconnecting") return "reconnecting";
    if (socketStatus === "connected") return "connected";
    if (sessionsQuery.isLoading) return "connecting";
    return "offline";
  }, [
    isAuthenticated,
    socketStatus,
    sessionsQuery.isLoading,
    sessionsQuery.isError,
    messagesQuery.isError,
  ]);

  const messagesLoading = Boolean(activeSessionId) && messagesQuery.isLoading;

  const messages: Message[] = useMemo(() => {
    const base =
      messagesQuery.data?.items && messagesQuery.data.items.length > 0
        ? messagesQuery.data.items
        : activeSessionId
          ? []
          : [WELCOME_MESSAGE];
    return pendingUserMessage ? [...base, pendingUserMessage] : base;
  }, [messagesQuery.data, activeSessionId, pendingUserMessage]);

  // --- Assistant chime ---------------------------------------------------
  // Ring a soft "tong" the moment a new assistant message appears (whether it
  // arrived via the send mutation or a socket broadcast). Skip the initial
  // mount and every session switch so loading history is silent.
  const lastAssistantIdRef = useRef<string | null>(null);
  const seededForSessionRef = useRef<string | null>(null);

  useEffect(() => {
    seededForSessionRef.current = null;
    lastAssistantIdRef.current = null;
  }, [activeSessionId]);

  useEffect(() => {
    let lastAssistantId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") {
        lastAssistantId = messages[i].id;
        break;
      }
    }
    if (!lastAssistantId) return;

    const sessionKey = activeSessionId ?? "__welcome__";
    if (seededForSessionRef.current !== sessionKey) {
      seededForSessionRef.current = sessionKey;
      lastAssistantIdRef.current = lastAssistantId;
      return;
    }

    if (lastAssistantId !== lastAssistantIdRef.current) {
      lastAssistantIdRef.current = lastAssistantId;
      playNotificationTone();
    }
  }, [messages, activeSessionId]);

  const handleSend = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      // Optimistic placeholder for the brand-new-session case (no cache to
      // patch yet). When sessionId is known, the mutation hook handles the
      // cache-level optimistic update itself.
      if (!activeSessionId) {
        setPendingUserMessage({
          id: `pending-${Date.now()}`,
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
          status: "sending",
        });
      }

      sendMutation.mutate(
        {
          sessionId: activeSessionId ?? undefined,
          content: trimmed,
        },
        {
          onSuccess: (response) => {
            setPendingUserMessage(null);
            setActiveSessionId(response.sessionId);
          },
          onError: () => {
            setPendingUserMessage(null);
            setToast("Couldn't send your message. Try again in a moment.");
          },
        },
      );
    },
    [activeSessionId, sendMutation],
  );

  const user: CurrentUser | null = authUser
    ? { name: authUser.name, email: authUser.email }
    : null;

  const handleNewAppointment = useCallback(() => {
    setDrawerInitial(null);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerInitial(null);
  }, []);

  const handleScheduleFromBooking = useCallback((booking: BookingExtract) => {
    setDrawerInitial(booking);
    setDrawerOpen(true);
    setView("chat");
  }, []);

  const handleCreateAppointment = useCallback(
    async (input: CreateAppointmentInput) => {
      try {
        await createAppointmentMutation.mutateAsync(input);
        setView("appointments");
        setToast(`Added “${input.title}” to your schedule.`);
      } catch (err) {
        setToast(getErrorMessage(err));
        throw new Error("create_failed");
      }
    },
    [createAppointmentMutation],
  );

  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const handleUpdateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      try {
        const updated = await updateAppointmentStatusMutation.mutateAsync({
          id,
          status,
        });
        const msg =
          status === "confirmed"
            ? `Confirmed “${updated.title}”.`
            : status === "cancelled"
              ? `Cancelled “${updated.title}”.`
              : `Restored “${updated.title}” to pending.`;
        setToast(msg);
      } catch (err) {
        setToast(getErrorMessage(err));
      }
    },
    [updateAppointmentStatusMutation],
  );

  // The "upcoming" cutoff depends on wall-clock time, which is impure in
  // render. Track `now` in state and tick once a minute so the count stays
  // accurate without forcing a render every paint.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const upcomingCount = useMemo(
    () =>
      appointments.filter(
        (a) => new Date(a.startAt).getTime() >= now && a.status !== "cancelled",
      ).length,
    [appointments, now],
  );

  useEffect(() => {
    if (!appointmentsQuery.isError) return;
    setToast("Could not load appointments from the server.");
  }, [appointmentsQuery.isError]);

  const selectedAppointment = useMemo(
    () => appointments.find((a) => a.id === selectedAppointmentId) ?? null,
    [appointments, selectedAppointmentId],
  );

  useEffect(() => {
    if (selectedAppointmentId && !selectedAppointment) {
      setSelectedAppointmentId(null);
    }
  }, [selectedAppointmentId, selectedAppointment]);

  if (authLoading || !user) {
    return (
      <SiteLoadingScreen
        message="Checking your session"
        submessage="Verifying credentials with the server."
      />
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-bg-base animate-loader-enter">
      <TopBar
        user={user}
        view={view}
        onViewChange={setView}
        appointmentsCount={upcomingCount}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col overflow-hidden lg:flex-row lg:items-stretch">
        <div
          className={`flex h-full min-h-0 w-full min-w-0 flex-1 flex-col lg:min-w-0 ${view === "chat" ? "" : "hidden"} lg:flex`}
        >
          <ChatPanel
            messages={messages}
            typing={sendMutation.isPending}
            status={connection}
            chatSessionId={activeSessionId}
            messagesLoading={messagesLoading}
            onSend={handleSend}
            onScheduleFromBooking={handleScheduleFromBooking}
          />
        </div>

        <div
          className={`flex h-full min-h-0 w-full min-w-0 flex-col ${view === "appointments" ? "flex" : "hidden"} lg:flex lg:w-[min(440px,44vw)] lg:min-w-[min(440px,44vw)] lg:max-w-[min(440px,44vw)] lg:shrink-0 lg:grow-0`}
        >
          <AppointmentsPanel
            appointments={appointments}
            onNewAppointment={handleNewAppointment}
            onSelectAppointment={handleSelectAppointment}
          />
        </div>
      </main>

      <BookingDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        initial={drawerInitial}
        onCreate={handleCreateAppointment}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
