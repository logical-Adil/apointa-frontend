"use client";

/**
 * Lightweight notification chime built with the Web Audio API.
 *
 * Why no audio file: avoids hosting / licensing / extra bytes, and gives us a
 * sound that matches the app's calm tone exactly. Two slightly detuned sine
 * waves with a quick exponential decay produce a soft "tong" / bell.
 *
 * Browser autoplay policies require a user gesture before the AudioContext
 * can actually produce sound. We create the context lazily and call
 * `resume()` on every play; the first chime in a session may be silent if the
 * user has not interacted yet — that is the platform behaviour, not a bug.
 */

const STORAGE_KEY = "appointa.sound.enabled";

let cachedContext: AudioContext | null = null;

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (cachedContext) return cachedContext;
  const w = window as WindowWithWebkitAudio;
  const Ctor: typeof AudioContext | undefined =
    w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    cachedContext = new Ctor();
    return cachedContext;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore quota / privacy-mode errors — toggling still works in-memory.
  }
}

/**
 * Play a short bell-like "tong". No-op when disabled, in SSR, or if the
 * browser blocks the AudioContext (autoplay policy).
 */
export function playNotificationTone(): void {
  if (!isSoundEnabled()) return;
  const ac = getContext();
  if (!ac) return;
  if (ac.state === "suspended") {
    void ac.resume().catch(() => undefined);
  }

  const now = ac.currentTime;
  const duration = 0.45;

  // Fundamental
  const oscA = ac.createOscillator();
  const gainA = ac.createGain();
  oscA.type = "sine";
  oscA.frequency.setValueAtTime(880, now); // A5
  gainA.gain.setValueAtTime(0.0001, now);
  gainA.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gainA.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscA.connect(gainA).connect(ac.destination);
  oscA.start(now);
  oscA.stop(now + duration);

  // Higher harmonic for the "shimmer" — quieter, decays faster.
  const oscB = ac.createOscillator();
  const gainB = ac.createGain();
  oscB.type = "sine";
  oscB.frequency.setValueAtTime(1320, now); // ~E6
  gainB.gain.setValueAtTime(0.0001, now);
  gainB.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
  gainB.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);
  oscB.connect(gainB).connect(ac.destination);
  oscB.start(now);
  oscB.stop(now + duration);
}
