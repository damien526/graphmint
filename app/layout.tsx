import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/inter-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const grotesk = localFont({
  src: "../public/fonts/space-grotesk-var.woff2",
  variable: "--font-grotesk",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Graphmint: Free Chart Maker, No Sign-Up",
    template: "%s | Graphmint",
  },
  description:
    "Make beautiful charts online in seconds. Free chart maker with no sign-up: paste your data, pick a style, download as PNG or SVG.",
  applicationName: "Graphmint",
  keywords: [
    "chart maker",
    "graph maker",
    "free chart maker",
    "online chart maker no sign up",
  ],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0fa678",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
