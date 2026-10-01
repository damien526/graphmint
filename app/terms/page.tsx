import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using Graphmint: a free chart maker provided as is. Your charts and data belong to you.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="content pt-12">
          <h1 className="font-display text-[2rem] font-semibold tracking-tight text-ink">
            Terms of Use
          </h1>
          <p className="mt-2 text-[13px] text-ink-3">Last updated: October 1, 2026</p>

          <h2>The service</h2>
          <p>
            Graphmint is a free online chart maker operated by Damien Yvert. It runs
            in your browser, requires no account, and is provided for personal and
            commercial use alike.
          </p>

          <h2>Your content</h2>
          <p>
            The data you enter and the charts you create are yours. We claim no
            rights over them, we never receive them (see the{" "}
            <Link href="/privacy">privacy policy</Link>), and you may use exported
            charts anywhere, with or without attribution. You are responsible for the
            content of the charts you create and share, including making sure you have
            the right to use the underlying data.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Do not use Graphmint to produce charts that are deliberately deceptive or
            unlawful, and do not attempt to disrupt the service, probe it for
            vulnerabilities beyond good-faith reporting, or scrape it at abusive
            volumes. If you find a security issue, please report it to{" "}
            <a href="mailto:damienyvert.dev@gmail.com">damienyvert.dev@gmail.com</a>.
          </p>

          <h2>No warranty</h2>
          <p>
            The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, free of charge and
            without warranty of any kind. We do not guarantee that it will be
            uninterrupted or error-free, that charts render identically in every
            browser, or that autosaved work can never be lost (it lives in your
            browser storage, which you or your browser can clear). Export important
            charts rather than relying on autosave.
          </p>

          <h2>Liability</h2>
          <p>
            To the extent permitted by law, we are not liable for indirect or
            consequential damages arising from the use of a free service, including
            lost data or lost profits. Nothing in these terms excludes liability that
            cannot be excluded by law.
          </p>

          <h2>Changes and termination</h2>
          <p>
            We may update, change or discontinue the service or these terms at any
            time. The current terms are always published on this page.
          </p>

          <h2>Law and contact</h2>
          <p>
            These terms are governed by French law. Questions:{" "}
            <a href="mailto:damienyvert.dev@gmail.com">damienyvert.dev@gmail.com</a>.
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
