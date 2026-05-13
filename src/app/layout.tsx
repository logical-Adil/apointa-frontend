import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased bg-bg-base text-text-primary">
        {children}
      </body>
    </html>
  );
}
