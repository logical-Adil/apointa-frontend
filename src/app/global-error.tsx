"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Last-resort boundary for crashes in the root layout itself.
 * Must declare its own <html> and <body>.
 *
 * Intentionally avoids importing `./globals.css` or Tailwind here — that
 * creates a separate CSS chunk Next preloads on every navigation, which
 * triggers a harmless but noisy “preloaded but not used” console warning when
 * no error occurs. Inline styles keep this tree self-contained.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Appointa] root error:", error);
  }, [error]);

  const bg = "#0b0f13";
  const surface = "#161c24";
  const text = "#e6ecf2";
  const muted = "#9aa6b2";
  const accent = "#2dd4bf";
  const danger = "#f87171";

  return (
    <html lang="en" style={{ height: "100%" }}>
      <body
        style={{
          minHeight: "100%",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          backgroundColor: bg,
          color: text,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: danger,
              margin: 0,
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              marginTop: "1rem",
              fontSize: "clamp(1.5rem, 4vw, 1.875rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 0,
            }}
          >
            Appointa couldn&apos;t start.
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: muted,
              marginBottom: 0,
            }}
          >
            Something failed before the app could render. Try reloading — if it keeps happening,
            sign out and back in.
          </p>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "stretch",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "3rem",
                minWidth: "10rem",
                border: "none",
                borderRadius: "0.75rem",
                backgroundColor: accent,
                color: "#0b0f13",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(45, 212, 191, 0.2)",
              }}
            >
              Reload app
            </button>
            <a
              href="/"
              style={{
                minHeight: "3rem",
                minWidth: "10rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.75rem",
                border: "1px solid #2a323d",
                backgroundColor: surface,
                color: text,
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>

          {error.digest ? (
            <p
              style={{
                marginTop: "2.5rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: muted,
              }}
            >
              Reference{" "}
              <span style={{ color: text, userSelect: "all" }}>{error.digest}</span>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
