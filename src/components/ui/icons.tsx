type IconProps = {
  className?: string;
  /** Stroke width override; defaults to a balanced 1.75 for outline icons. */
  strokeWidth?: number;
};

/** Universal close (×) glyph. Sized via `className`. */
export function CloseIcon({
  className = "size-5",
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
