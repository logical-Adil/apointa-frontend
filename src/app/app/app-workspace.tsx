"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppointmentDetailModal } from "@/components/app/appointment-detail-modal";
import { AppointmentsPanel } from "@/components/app/appointments-panel";
import { BookingDrawer } from "@/components/app/booking-drawer";
import { ChatPanel } from "@/components/app/chat-panel";
import { Toast } from "@/components/app/toast";
import { TopBar } from "@/components/app/top-bar";
import { generateAssistantReply } from "@/lib/app/ai-simulator";
import {
  seedAppointments,
  seedMessages,
  seedUser,
} from "@/lib/app/seed-data";
import type {
  AppViewMode,
  Appointment,
  AppointmentStatus,
  ConnectionStatus,
  CurrentUser,
  Message,
} from "@/lib/app/types";
import { getCurrentUser, getToken } from "@/lib/auth";

export function AppWorkspace() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<CurrentUser>(seedUser);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [appointments, setAppointments] =
    useState<Appointment[]>(seedAppointments);
  const [typing, setTyping] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const [view, setView] = useState<AppViewMode>("chat");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    const t = window.setTimeout(() => setConnection("connected"), 900);
    return () => window.clearTimeout(t);
  }, [authChecked]);

  const handleSend = useCallback(
    (content: string) => {
      const now = new Date().toISOString();
      const userMessage: Message = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        content,
        createdAt: now,
        status: "sent",
      };
      setMessages((current) => [...current, userMessage]);

      const delay = 600 + Math.min(1200, content.length * 12);
      setTyping(true);
      window.setTimeout(() => {
        setMessages((current) => {
          const reply = generateAssistantReply(content, current);
          return [...current, reply];
        });
        setTyping(false);
      }, delay);
    },
    [],
  );

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

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return appointments.filter(
      (a) => new Date(a.startAt).getTime() >= now && a.status !== "cancelled",
    ).length;
  }, [appointments]);

  if (!authChecked) {
    return (
      <div
        className="flex h-[100dvh] items-center justify-center bg-bg-base"
        aria-busy="true"
      >
        <span className="sr-only">Checking session…</span>
        <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden />
      </div>
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
            typing={typing}
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
