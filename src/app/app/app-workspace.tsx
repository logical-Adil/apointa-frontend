"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppointmentDetailModal } from "@/components/app/appointment-detail-modal";
import { AppointmentsPanel } from "@/components/app/appointments-panel";
import { BookingDrawer } from "@/components/app/booking-drawer";
import { ChatPanel } from "@/components/app/chat-panel";
import { Toast } from "@/components/app/toast";
import { TopBar } from "@/components/app/top-bar";
import { SiteLoadingScreen } from "@/components/site-loading";
import { useAuth } from "@/features/auth";
import {
  useChatMessages,
  useChatSessions,
  useSendMessage,
} from "@/features/chat";
import { seedAppointments } from "@/lib/app/seed-data";
import type {
  AppViewMode,
  Appointment,
  AppointmentStatus,
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
  const [appointments, setAppointments] =
    useState<Appointment[]>(seedAppointments);
  const [view, setView] = useState<AppViewMode>("chat");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // --- Chat data ---------------------------------------------------------
  const sessionsQuery = useChatSessions({ enabled: isAuthenticated });
  const messagesQuery = useChatMessages(activeSessionId ?? undefined, {
    enabled: Boolean(activeSessionId) && isAuthenticated,
  });
  const sendMutation = useSendMessage();

  // Pick the most recently updated session as the active one when sessions load.
  useEffect(() => {
    if (!sessionsQuery.data || activeSessionId) return;
    const first = sessionsQuery.data.items[0];
    if (first) setActiveSessionId(first.id);
  }, [sessionsQuery.data, activeSessionId]);

  const connection: ConnectionStatus = useMemo(() => {
    if (!isAuthenticated || sessionsQuery.isLoading) return "connecting";
    if (sessionsQuery.isError || messagesQuery.isError) return "reconnecting";
    return "connected";
  }, [
    isAuthenticated,
    sessionsQuery.isLoading,
    sessionsQuery.isError,
    messagesQuery.isError,
  ]);

  const messages: Message[] = useMemo(() => {
    const base =
      messagesQuery.data?.items && messagesQuery.data.items.length > 0
        ? messagesQuery.data.items
        : activeSessionId
          ? []
          : [WELCOME_MESSAGE];
    return pendingUserMessage ? [...base, pendingUserMessage] : base;
  }, [messagesQuery.data?.items, activeSessionId, pendingUserMessage]);

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
            setActiveSessionId(response.sessionId);
            setPendingUserMessage(null);
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
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleCreateAppointment = useCallback((appointment: Appointment) => {
    setAppointments((current) => [...current, appointment]);
    setDrawerOpen(false);
    setView("appointments");
    setToast(`Added “${appointment.title}” to your appointments.`);
  }, []);

  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const handleUpdateStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      let updated: Appointment | undefined;
      setAppointments((current) =>
        current.map((a) => {
          if (a.id !== id) return a;
          updated = { ...a, status };
          return updated;
        }),
      );
      if (updated) {
        const msg =
          status === "confirmed"
            ? `Confirmed “${updated.title}”.`
            : status === "cancelled"
              ? `Cancelled “${updated.title}”.`
              : `Restored “${updated.title}” to pending.`;
        setToast(msg);
      }
    },
    [],
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

  if (authLoading || !user) {
    return (
      <SiteLoadingScreen
        message="Checking your session"
        submessage="Verifying credentials with the server."
      />
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-bg-base">
      <TopBar
        user={user}
        view={view}
        onViewChange={setView}
        appointmentsCount={upcomingCount}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col overflow-hidden lg:flex-row">
        <div
          className={`flex h-full min-h-0 w-full min-w-0 flex-1 flex-col ${view === "chat" ? "" : "hidden"} lg:flex`}
        >
          <ChatPanel
            messages={messages}
            typing={sendMutation.isPending}
            status={connection}
            onSend={handleSend}
          />
        </div>

        <div
          className={`flex h-full min-h-0 w-full min-w-0 flex-col ${view === "appointments" ? "flex" : "hidden"} lg:flex lg:w-auto lg:max-w-[min(440px,44vw)] lg:shrink-0`}
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
        onSubmit={handleCreateAppointment}
      />

      <AppointmentDetailModal
        appointment={
          appointments.find((a) => a.id === selectedAppointmentId) ?? null
        }
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
