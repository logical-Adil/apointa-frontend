import type { BookingExtract, BookingField } from "@/lib/app/types";

type BookingChipProps = {
  booking: BookingExtract;
  className?: string;
  /** When set, shows the primary CTA (only when nothing is missing). */
  onUseInForm?: () => void;
  /** When true and fields are missing, show a short footer (workspace only). */
  showIncompleteHint?: boolean;
};

const FIELD_ORDER: Array<{
  key: BookingField;
  label: string;
}> = [
  { key: "service", label: "Service" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "duration", label: "Duration" },
  { key: "notes", label: "Notes" },
];

export function BookingChip({
  booking,
  className,
  onUseInForm,
  showIncompleteHint = false,
}: BookingChipProps) {
  const hasMissing = booking.missingFields.length > 0;
  const showScheduleCta = Boolean(onUseInForm) && !hasMissing;

  return (
    <div
      className={`${className ?? "mt-3"} overflow-hidden rounded-[22px] border border-border-subtle bg-bg-base/75 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-bg-base/65 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] dark:ring-white/[0.06]`}
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-surface/30 px-3.5 py-2.5 dark:bg-bg-surface/20">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Extracted booking
        </p>
        {hasMissing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning ring-1 ring-warning/25">
            <span className="size-1 rounded-full bg-warning" aria-hidden />
            {booking.missingFields.length} missing
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success ring-1 ring-success/25">
            <span className="size-1 rounded-full bg-success" aria-hidden />
            Ready
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-3.5 py-3 text-xs">
        {FIELD_ORDER.map((field) => {
          const value = booking[field.key];
          const missing = booking.missingFields.includes(field.key);
          return (
            <div
              key={field.key}
              className={`min-w-0 ${field.key === "notes" ? "col-span-2" : ""}`}
            >
              <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {field.label}
              </dt>
              <dd
                className={`mt-0.5 truncate text-sm font-medium ${
                  missing ? "text-warning" : "text-text-primary"
                }`}
              >
                {missing ? "Needed" : value ?? "—"}
              </dd>
            </div>
          );
        })}
      </dl>
      {showScheduleCta ? (
        <div className="border-t border-border-subtle px-3.5 pb-3 pt-2.5">
          <button
            type="button"
            onClick={onUseInForm}
            aria-label="Open booking form with these details from the chat"
            className="w-full rounded-[14px] bg-accent-soft py-2.5 text-xs font-semibold text-accent ring-1 ring-accent/25 transition-colors hover:bg-accent/10"
          >
            Review & schedule
          </button>
        </div>
      ) : showIncompleteHint && hasMissing ? (
        <div className="border-t border-border-subtle bg-bg-surface/40 px-3.5 pb-3 pt-2.5">
          <p className="text-center text-[11px] leading-snug text-text-muted">
            Reply in chat until every field is filled — then you can save this to your calendar.
          </p>
        </div>
      ) : null}
    </div>
  );
}
