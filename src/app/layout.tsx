import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import { SiteChrome } from "@/components/site/site-chrome";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Appointa — Book appointments in a conversation",
  description:
    "AI-assisted appointment booking. Describe what you need; Appointa understands, extracts details, and confirms your schedule.",
  icons: {
    icon: [
      { url: "/appointa-mark-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/appointa-mark-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/appointa-mark-dark.svg", type: "image/svg+xml" },
    ],
    apple: "/appointa-logo.png",
  },
  openGraph: {
    title: "Appointa",
    description: "Book appointments in a conversation.",
    images: ["/appointa-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased bg-bg-base text-text-primary overflow-x-hidden">
        <Script
          id="appointa-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var v=localStorage.getItem(k);if(v==="light")document.documentElement.classList.add("light");else document.documentElement.classList.remove("light");}catch(e){}})();`,
          }}
        />
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
