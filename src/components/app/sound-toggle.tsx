"use client";

import { useEffect, useState } from "react";
import {
  isSoundEnabled,
  playNotificationTone,
  setSoundEnabled,
} from "@/lib/sound/notification";

/**
 * Speaker on / off toggle for the assistant chime.
 * Persists to localStorage; plays a confirmation chime when turning sound on
 * (also lets the browser unlock the AudioContext for the rest of the session).
 */
export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isSoundEnabled());
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex size-11 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface"
        aria-hidden
      />
    );
  }

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      // Brief preview AND unlocks the AudioContext under autoplay policies.
      playNotificationTone();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute assistant chime" : "Enable assistant chime"}
      title={enabled ? "Mute assistant chime" : "Enable assistant chime"}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-bg-surface text-text-secondary transition-colors duration-200 hover:border-border-strong hover:bg-bg-elevated hover:text-text-primary"
    >
      {enabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </button>
  );
}

function SpeakerOnIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l4.5-3.75v13.5L9 15H5.25a.75.75 0 01-.75-.75v-4.5A.75.75 0 015.25 9H9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25a4.5 4.5 0 010 7.5M19.5 5.25a8.25 8.25 0 010 13.5"
      />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9l4.5-3.75v13.5L9 15H5.25a.75.75 0 01-.75-.75v-4.5A.75.75 0 015.25 9H9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9l4 4m0-4l-4 4"
      />
    </svg>
  );
}
