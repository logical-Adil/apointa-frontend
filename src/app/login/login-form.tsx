"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { TextField } from "@/components/auth/text-field";
import { useAuth, useLogin } from "@/features/auth";
import { getErrorMessage, getFieldErrors } from "@/lib/api/errors";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();

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
    if (Object.keys(validation).length > 0) return;

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        setErrors(fieldErrors as FieldErrors);
      } else {
        setFormError(getErrorMessage(error));
      }
    }
  }

  const submitting = loginMutation.isPending;
  const handingOff = loginMutation.isSuccess || isAuthenticated;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.65rem]">
          Sign In
        </h1>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-text-secondary">
          Enter your details to access your dashboard.
        </p>
      </header>

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
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
        required
        disabled={submitting}
      />

      <TextField
        leadingIcon="password"
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        required
        disabled={submitting}
        labelAccessory={
          <button
            type="button"
            className="text-[12px] font-medium text-accent transition-colors hover:text-accent-hover"
            title="Password recovery is not enabled in this prototype"
          >
            Forgot password?
          </button>
        }
      />

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
            <Spinner /> Signing in…
          </>
        ) : handingOff ? (
          <>
            <CheckIcon className="size-4" /> Opening your workspace…
          </>
        ) : (
          <>
            Sign In
            <ArrowIcon />
          </>
        )}
      </button>

      <p className="pt-1 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
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
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function CheckIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} transition-opacity duration-150`}
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
