import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account · Appointa",
  description:
    "Create your Appointa account and start booking appointments through natural conversation.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      sideEyebrow="Get started free"
      sideTitle="Booking in plain language, finally."
      sideBody="Describe what you need, and Appointa extracts the details—date, time, duration. Smart fallback when anything is still missing."
    >
      <header className="animate-fade-up">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Create account
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Free to start — no credit card required.
        </p>
      </header>

      <div className="animate-fade-up animation-delay-1 mt-8">
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
