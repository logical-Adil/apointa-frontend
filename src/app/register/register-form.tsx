"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/text-field";
import { getToken, signUp } from "@/lib/auth";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type StrengthLevel = "weak" | "fair" | "good" | "strong";

function getStrength(pw: string): { level: StrengthLevel; label: string; pct: number } {
  if (!pw) return { level: "weak", label: "", pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: "weak", label: "Weak", pct: 25 };
  if (score === 2) return { level: "fair", label: "Fair", pct: 50 };
  if (score === 3) return { level: "good", label: "Good", pct: 75 };
  return { level: "strong", label: "Strong", pct: 100 };
}

const strengthColors: Record<StrengthLevel, string> = {
  weak: "bg-danger",
  fair: "bg-warning",
  good: "bg-info",
  strong: "bg-success",
};

const strengthText: Record<StrengthLevel, string> = {
  weak: "text-danger",
  fair: "text-warning",
  good: "text-info",
  strong: "text-success",
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/app");
  }, [router]);

  const strength = getStrength(password);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) {
      next.name = "Name is required.";
    } else if (name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }
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
    if (Object.keys(validation).length > 0) return;

    try {
      setSubmitting(true);
      // Dummy auth: stash token + user in localStorage and proceed.
      // TODO: replace with POST /v1/auth/register once the API is wired.
      await new Promise((resolve) => setTimeout(resolve, 600));
      signUp(name, email);
      router.replace("/app");
    } catch {
      setFormError("Something went wrong. Please try again.");
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
        label="Full name"
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Ada Lovelace"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <div className="flex flex-col gap-1.5">
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        {password.length > 0 ? (
          <div className="flex items-center gap-3 pt-0.5">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${strengthColors[strength.level]}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
            <span className={`min-w-[3rem] text-right text-xs font-medium ${strengthText[strength.level]}`}>
              {strength.label}
            </span>
          </div>
        ) : null}

        {password.length === 0 ? (
          <p className="text-xs text-text-muted">
            Use 8+ characters, mix letters, numbers, and symbols for a stronger password.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Spinner /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </button>

      <div className="relative my-1 flex items-center text-xs uppercase tracking-widest text-text-muted">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="px-3">or</span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
