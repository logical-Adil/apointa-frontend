import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
