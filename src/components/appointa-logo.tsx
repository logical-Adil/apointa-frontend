"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type LogoProps = {
  /** Smaller mark + type (e.g. footer on mobile) */
  compact?: boolean;
  className?: string;
  /** Header / LCP */
  priority?: boolean;
  /** Show “Appointa” next to the mark (uses theme text color) */
  showWordmark?: boolean;
};

function subscribe(onStoreChange: () => void) {
  const root = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("appointa-theme", onStoreChange);
  return () => {
    obs.disconnect();
    window.removeEventListener("appointa-theme", onStoreChange);
  };
}

function isLightMode() {
  return document.documentElement.classList.contains("light");
}

function serverLight() {
  return false;
}

export function AppointaLogo({
  compact = false,
  className = "",
  priority = false,
  showWordmark = true,
}: LogoProps) {
  const light = useSyncExternalStore(subscribe, isLightMode, serverLight);
  const markSrc = light ? "/appointa-mark-light.svg" : "/appointa-mark-dark.svg";

  const box = compact ? "size-8" : "size-9 sm:size-10";

  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      <span className={`relative shrink-0 ${box}`}>
        <Image
          src={markSrc}
          alt=""
          fill
          priority={priority}
          className="object-contain"
          sizes="40px"
        />
      </span>
      {showWordmark ? (
        <span
          className={`font-semibold tracking-tight text-text-primary transition-colors duration-200 ${
            compact ? "text-base" : "text-lg sm:text-xl"
          }`}
        >
          Appointa
        </span>
      ) : null}
    </span>
  );
}
