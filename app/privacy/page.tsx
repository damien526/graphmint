import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { contentPageGraph, jsonLdGraph } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Graphmint handles your data: charts are rendered in your browser and never uploaded, there are no accounts and no cookies, and analytics are cookieless and aggregated.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            contentPageGraph({
              url: absoluteUrl("/privacy"),
              name: "Privacy Policy",
              description: metadata.description as string,
              crumb: "Privacy",
            }),
          ),
        }}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="content pt-12">
          <h1 className="font-display text-[2rem] font-semibold tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="mt-2 text-[13px] text-ink-3">Last updated: October 1, 2026</p>

          <h2>The short version</h2>
          <p>
            Graphmint has no accounts, sets no cookies, and never uploads your chart
            data. Everything you type is processed inside your browser. The only data
            we see is anonymous, aggregated usage statistics (like how many people
            visited a page), collected without cookies.
          </p>

          <h2>Who operates this site</h2>
          <p>
            Graphmint is operated by Damien Yvert. For any privacy question or
            request, write to{" "}
            <a href="mailto:damienyvert.dev@gmail.com">damienyvert.dev@gmail.com</a>.
          </p>

          <h2>Your chart data</h2>
          <p>
            The numbers, labels and titles you enter are rendered into a chart by code
            running entirely in your browser. They are never sent to our servers, and
            we could not read them if we wanted to. Two things happen locally:
          </p>
          <ul>
            <li>
              <strong>Autosave.</strong> Your current chart is saved in your browser&rsquo;s
              localStorage so it is still there when you come back. It stays on your
              device; clearing your browser data removes it.
            </li>
            <li>
              <strong>Share links.</strong> When you click &ldquo;Share link&rdquo;, the chart is
              compressed and encoded into the part of the URL after the # symbol.
              Browsers do not send that fragment to servers, so the link works without
              us storing anything. Keep in mind that anyone you give the link to can
              read the chart it contains, and that URLs you share through other
              services (email, chat) are handled by those services.
            </li>
          </ul>
          <p>
            Exported files (PNG, SVG, clipboard) are generated locally and go straight
            from your browser to your disk or clipboard.
          </p>

          <h2>Analytics</h2>
          <p>
            We use Vercel Web Analytics to understand overall traffic. It is
            cookieless: it sets no cookies, stores no identifier on your device, and
            does not track you across sites. We see aggregated counts (page views,
            referrer, country, device type), not individual profiles. Data is
            processed on our behalf by Vercel Inc.
          </p>

          <h2>Hosting and server logs</h2>
          <p>
            The site is hosted by Vercel Inc. Like any web host, Vercel processes
            technical data (such as your IP address) transiently to deliver pages and
            protect the service against abuse. See{" "}
            <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer">
              Vercel&rsquo;s privacy policy
            </a>{" "}
            for details.
          </p>

          <h2>Cookies</h2>
          <p>
            Graphmint sets no cookies, which is why you see no cookie banner.
          </p>

          <h2>Your rights</h2>
          <p>
            Under the GDPR and similar laws you have rights of access, rectification,
            erasure and objection. Because we hold no personal data about you, there
            is usually nothing on our side to access or delete: your chart data lives
            only in your browser, and you can remove it by clearing site data. If you
            believe we hold something about you or have any question, contact{" "}
            <a href="mailto:damienyvert.dev@gmail.com">damienyvert.dev@gmail.com</a>{" "}
            and we will answer promptly. You may also lodge a complaint with your
            local supervisory authority (in France, the CNIL).
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the new version is published on this page with an
            updated date. Since the service collects nothing personal, changes should
            be rare and minor.
          </p>

          <p>
            <Link href="/">Back to the chart maker</Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
