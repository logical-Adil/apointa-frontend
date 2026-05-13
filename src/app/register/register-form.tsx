"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/text-field";
import { Spinner } from "@/components/ui/spinner";
import { useAuth, useRegister } from "@/features/auth";
import { getErrorMessage, getFieldErrors } from "@/lib/api/errors";
import { passwordRegisterRequirements } from "@/lib/auth/password-policy";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

type StrengthLevel = "weak" | "fair" | "good" | "strong";

type Strength = {
  level: StrengthLevel;
  label: string;
  pct: number;
  checks: { id: string; label: string; ok: boolean }[];
};

function getStrength(pw: string): Strength {
  const r = passwordRegisterRequirements(pw);
  const checks = [
    { id: "len", label: "At least 8 characters", ok: r.len },
    { id: "upper", label: "An uppercase letter", ok: r.upper },
    { id: "num", label: "A number", ok: r.num },
    { id: "sym", label: "A symbol", ok: r.sym },
  ];
  const score = checks.filter((c) => c.ok).length + (pw.length >= 12 ? 1 : 0);
  if (!pw) return { level: "weak", label: "", pct: 0, checks };
  if (score <= 1) return { level: "weak", label: "Weak", pct: 25, checks };
  if (score === 2) return { level: "fair", label: "Fair", pct: 50, checks };
  if (score === 3) return { level: "good", label: "Good", pct: 75, checks };
  return { level: "strong", label: "Strong", pct: 100, checks };
}

const strengthTint: Record<StrengthLevel, string> = {
  weak: "bg-border-strong",
  fair: "bg-accent/45",
  good: "bg-accent/75",
  strong: "bg-accent",
};

const strengthLabel: Record<StrengthLevel, string> = {
  weak: "text-text-muted",
  fair: "text-text-secondary",
  good: "text-accent",
  strong: "text-accent",
};

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const didNavigateToApp = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (didNavigateToApp.current) return;
    didNavigateToApp.current = true;
    router.replace("/app");
  }, [isAuthenticated, router]);

  const strength = useMemo(() => getStrength(password), [password]);

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
    } else {
      const r = passwordRegisterRequirements(password);
      if (!r.upper) {
        next.password = "Add an uppercase letter (A–Z).";
      } else if (!r.num) {
        next.password = "Add a number (0–9).";
      } else if (!r.sym) {
        next.password = "Add a symbol (e.g. ! @ # $).";
      }
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
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        setErrors(fieldErrors as FieldErrors);
      } else {
        setFormError(getErrorMessage(error));
      }
    }
  }

  const submitting = registerMutation.isPending;
  const handingOff = registerMutation.isSuccess || isAuthenticated;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <header className="animate-fade-up animation-delay-1">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.65rem]">
          Sign Up
        </h1>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-text-secondary">
          Enter your details to create your account and open your dashboard.
        </p>
      </header>

      <div className="flex flex-col gap-5 animate-fade-up animation-delay-2">
        {formError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/[0.08] px-3.5 py-3 text-sm text-danger animate-fade-in"
          >
            <AlertIcon />
            <span className="leading-snug">{formError}</span>
          </div>
        ) : null}

        <TextField
          leadingIcon="user"
          label="Full name"
          type="text"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
          disabled={submitting}
        />

        <TextField
          leadingIcon="email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          autoCapitalize="off"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          disabled={submitting}
        />

        <div className="flex flex-col gap-2">
          <TextField
            leadingIcon="password"
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            disabled={submitting}
          />

          <div className="space-y-2 pt-0.5" aria-live="polite">
            <div className="relative h-1 overflow-hidden rounded-full bg-border-subtle">
              <span
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                  password ? strengthTint[strength.level] : "bg-transparent"
                }`}
                style={{ width: password ? `${strength.pct}%` : "0%" }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  password ? strengthLabel[strength.level] : "text-text-muted"
                }`}
              >
                {password ? strength.label : "Strength"}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {strength.checks.map((c) => (
                <li
                  key={c.id}
                  className={`inline-flex items-center gap-1.5 text-[11px] transition-colors ${
                    c.ok ? "text-accent" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`inline-flex size-3 shrink-0 items-center justify-center rounded-full transition-colors ${
                      c.ok ? "bg-accent-soft text-accent" : "bg-bg-surface text-text-muted"
                    }`}
                    aria-hidden
                  >
                    {c.ok ? <MicroCheck /> : <MicroDot />}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || handingOff}
          className="group relative mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent px-6 text-sm font-semibold text-[#0B0F13] shadow-sm shadow-accent/15 transition-all duration-200 hover:bg-accent-hover hover:shadow-md hover:shadow-accent/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden
          />
          {submitting ? (
            <>
              <Spinner /> Creating account…
            </>
          ) : handingOff ? (
            <>
              <CheckIcon /> Opening your workspace…
            </>
          ) : (
            <>
              Sign Up
              <ArrowIcon />
            </>
          )}
        </button>
      </div>

      <p className="animate-fade-up animation-delay-3 pt-1 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
    </svg>
  );
}

function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function MicroCheck() {
  return (
    <svg className="size-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
    </svg>
  );
}

function MicroDot() {
  return (
    <svg className="size-1.5" viewBox="0 0 8 8" aria-hidden>
      <circle cx="4" cy="4" r="2" fill="currentColor" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v6M12 16.5v.5" />
    </svg>
  );
}
