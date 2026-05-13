"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/text-field";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      // TODO: integrate with /v1/auth/login once the API client is wired up.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setFormError("Authentication is not wired up yet. This is the UI only.");
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3 text-sm text-warning"
        >
          {formError}
        </div>
      ) : null}

      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        required
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        required
      />

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Spinner /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <div className="relative my-2 flex items-center text-xs uppercase tracking-widest text-text-muted">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="px-3">or</span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <p className="text-center text-sm text-text-secondary">
        New to Appointa?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
