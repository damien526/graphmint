import Link from "next/link";
import type { MakerPage } from "@/lib/makers";
import { SITE_URL } from "@/lib/site";
import { Studio } from "./Studio";
import { SiteHeader, SiteFooter } from "./Site";

export function TrustBadges() {
  const items = ["100% free", "No sign-up", "Data stays in your browser", "PNG & SVG export"];
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-mint-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5l3.2 3L13 4.5" />
          </svg>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <div className="not-prose mt-4 overflow-hidden rounded-card border border-line bg-card">
      {faq.map((f, i) => (
        <details key={i} className="group border-b border-line last:border-b-0" {...(i === 0 ? { open: true } : {})}>
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-ink transition hover:bg-paper [&::-webkit-details-marker]:hidden">
            {f.q}
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-open:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
          </summary>
          <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function MakerLanding({ maker }: { maker: MakerPage }) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${maker.h1} | Graphmint`,
      url: `${SITE_URL}/${maker.slug}`,
      applicationCategory: "DesignApplication",
      operatingSystem: "Any (web browser)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: "No sign-up, PNG export, SVG export, paste from Excel, share link",
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to make a ${maker.h1.replace(/ Maker$/i, "").toLowerCase()}`,
      step: maker.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: maker.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Graphmint", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: maker.h1, item: `${SITE_URL}/${maker.slug}` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pb-8 pt-10 text-center sm:pt-14">
          <h1 className="font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[2.9rem]">
            {maker.h1}
            <span className="text-mint-600">.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2 sm:text-[16.5px]">
            {maker.tagline}
          </p>
          <div className="mt-5">
            <TrustBadges />
          </div>
        </section>

        <Studio initialType={maker.type} />

        <article className="content mx-auto mt-16 max-w-3xl">
          {maker.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2>How to make a {maker.h1.replace(/ Maker$/i, "").toLowerCase()} online</h2>
          <ol>
            {maker.steps.map((s, i) => (
              <li key={i}>
                <strong>{s.name}.</strong> {s.text}
              </li>
            ))}
          </ol>

          <h2>{maker.whenTitle}</h2>
          {maker.when.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2>Quick tips for a chart people trust</h2>
          <ul>
            {maker.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <h2>Frequently asked questions</h2>
          <FaqList faq={maker.faq} />

          <h2>Other chart makers</h2>
          <div className="not-prose mt-4 flex flex-wrap gap-2">
            {maker.related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="rounded-full border border-line bg-card px-4 py-2 text-[13.5px] font-medium text-ink-2 transition hover:border-mint-500 hover:text-mint-700"
              >
                {r.label} →
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-full border border-line bg-card px-4 py-2 text-[13.5px] font-medium text-ink-2 transition hover:border-mint-500 hover:text-mint-700"
            >
              All chart types →
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
