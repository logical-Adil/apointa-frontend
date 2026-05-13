"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Extra tailwind / inline classes applied once visible */
  visibleClass?: string;
};

/**
 * Fades + slides up children when they scroll into view.
 * Falls back to instant-visible if IntersectionObserver is unavailable.
 */
export function AnimateIn({
  children,
  className = "",
  delay = 0,
  visibleClass = "",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${className} ${
        visible ? `opacity-100 translate-y-0 ${visibleClass}` : "opacity-0 translate-y-5"
      }`}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
