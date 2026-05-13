import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in · Appointa",
  description: "Welcome back. Sign in to continue managing your appointments with Appointa.",
};

export default function LoginPage() {
  return (
    <AuthShell
      sideEyebrow="Welcome back"
      sideTitle="Your appointments, exactly where you left them."
      sideBody="Sign in to resume conversations, review upcoming bookings, and let Appointa handle the scheduling details."
    >
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Enter your account details to continue.
        </p>
      </header>

      <div className="animate-fade-up animation-delay-1 mt-8">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
