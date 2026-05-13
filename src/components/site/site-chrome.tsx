"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNavbar } from "@/components/site/site-navbar";

/**
 * Workspace (`/app`) keeps its own top bar; every other route gets the same
 * fixed navbar + thin footer for a consistent marketing / auth shell.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/app")) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteNavbar />
      <div className="flex min-h-dvh flex-col pt-14">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
