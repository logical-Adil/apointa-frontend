import type { BookingExtract, BookingField } from "@/lib/app/types";

type BookingChipProps = {
  booking: BookingExtract;
  className?: string;
  /** When set, shows a control to open the booking drawer with this extract. */
  onUseInForm?: () => void;
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

export function BookingChip({ booking, className, onUseInForm }: BookingChipProps) {
  const hasMissing = booking.missingFields.length > 0;

  return (
    <div
      className={`${className ?? "mt-3"} overflow-hidden rounded-2xl border border-border-subtle bg-bg-base/70 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-3.5 py-2.5">
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
      {onUseInForm ? (
        <div className="border-t border-border-subtle px-3.5 py-2.5">
          <button
            type="button"
            onClick={onUseInForm}
            aria-label="Open booking form with these details from the chat"
            className="w-full rounded-xl bg-accent-soft py-2.5 text-xs font-semibold text-accent ring-1 ring-accent/25 transition-colors hover:bg-accent/10"
          >
            Review & schedule
          </button>
        </div>
      ) : null}
    </div>
  );
}
