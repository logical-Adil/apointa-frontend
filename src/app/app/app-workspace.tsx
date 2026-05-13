"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppointmentsPanel } from "@/components/app/appointments-panel";
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
  const [appointments] = useState<Appointment[]>(seedAppointments);
  const [typing, setTyping] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const [view, setView] = useState<AppViewMode>("chat");
  const [toast, setToast] = useState<string | null>(null);

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
    setToast(
      "Use the chat to start booking — Appointa extracts the details for you. The dedicated form opens here next.",
    );
    setView("chat");
  }, []);

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

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 overflow-hidden">
        <div
          className={`flex h-full flex-1 ${view === "chat" ? "" : "hidden"} md:flex`}
        >
          <ChatPanel
            messages={messages}
            typing={typing}
            status={connection}
            onSend={handleSend}
          />
        </div>

        <div
          className={`h-full w-full ${view === "appointments" ? "flex" : "hidden"} md:flex md:w-auto`}
        >
          <AppointmentsPanel
            appointments={appointments}
            onNewAppointment={handleNewAppointment}
          />
        </div>
      </main>

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
