import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/Analytics";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl,
  ogImageUrl,
} from "@/lib/site";
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
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  /*
   * No `keywords`. Google dropped meta keywords as a ranking signal in 2009 and
   * has said since that it ignores the tag outright; Bing treats stuffing it as
   * a negative signal. Four terms sat here doing nothing except inviting the
   * next reader to maintain them. The terms themselves are not lost — they are
   * in the title, the description and the maker catalogue, where they are read.
   */
  /**
   * Open Graph and Twitter defaults, declared here rather than page by page.
   *
   * /privacy and /terms used to ship with no social tags at all: they set no
   * `openGraph` block of their own, and there was nothing here to inherit. A
   * default costs one declaration and covers every page that doesn't care to
   * override it.
   */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: absoluteUrl("/"),
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImageUrl(),
        width: 1200,
        height: 630,
        alt: "Graphmint: beautiful charts in seconds.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl()],
  },
  /**
   * By default Google truncates the snippet it shows and allows only a small
   * thumbnail. The last two directives lift both limits: the snippet can carry
   * a whole answer, and the social card — a real chart, rendered — can show
   * large. `noindex` still sits where it belongs: the 404 declares it for
   * itself and overrides these values.
   */
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  /**
   * Search Console verification. The token arrives through the environment
   * rather than the repo: it isn't code, and Google can rotate it without a
   * commit. Absent, Next writes nothing — no empty tag ships to production.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
