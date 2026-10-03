import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { absoluteUrl } from "@/lib/site";

/**
 * The 404 declares its own `noindex`, which overrides the `index: true` of the
 * root layout — without it, every mistyped URL was an indexable page claiming
 * to be indexable.
 *
 * The canonical is pinned to the home page rather than left to the layout's
 * default. A relative canonical resolves against the internal `_not-found`
 * segment, which produces `…/_not-found` — an address that returns 404 and
 * that nothing should point at.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  alternates: { canonical: absoluteUrl("/") },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
        <p className="font-display text-[5rem] font-semibold leading-none text-mint-600">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          This page doesn’t exist
        </h1>
        <p className="mt-2 max-w-md text-[14.5px] text-ink-2">
          But your next chart does. Head back to the editor and make something beautiful.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-ctrl bg-mint-600 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-mint-700"
        >
          Open the chart maker
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
