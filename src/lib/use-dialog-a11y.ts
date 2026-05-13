import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type UseDialogA11yOptions = {
  /** Whether the dialog is currently open. The hook is a no-op when `false`. */
  open: boolean;
  /** Called on Escape and any other parent-driven close path. */
  onClose: () => void;
  /** Ref to the dialog panel element used for focus trapping. */
  panelRef: RefObject<HTMLElement | null>;
  /**
   * Optional element to focus when the dialog opens. Falls back to letting
   * the browser pick if not provided.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Delay (ms) before moving focus, leaves room for entry animation. */
  initialFocusDelayMs?: number;
};

/**
 * Shared a11y plumbing for centred modals and edge drawers:
 *  - Auto-focuses `initialFocusRef` on open (after a small delay).
 *  - Closes on Escape.
 *  - Traps Tab focus within `panelRef`.
 *  - Locks `body` scroll while open and restores on close.
 *
 * Render the dialog DOM yourself; this hook only wires behaviour.
 */
export function useDialogA11y({
  open,
  onClose,
  panelRef,
  initialFocusRef,
  initialFocusDelayMs = 80,
}: UseDialogA11yOptions): void {
  useEffect(() => {
    if (!open || !initialFocusRef) return;
    const t = window.setTimeout(
      () => initialFocusRef.current?.focus(),
      initialFocusDelayMs,
    );
    return () => window.clearTimeout(t);
  }, [open, initialFocusRef, initialFocusDelayMs]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables =
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, panelRef]);
}
