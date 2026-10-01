import type { Metadata } from "next";
import Link from "next/link";
import { Studio } from "@/components/Studio";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { TrustBadges, FaqList } from "@/components/MakerLanding";
import { MAKERS } from "@/lib/makers";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Free Chart Maker — Beautiful Charts in Seconds, No Sign-Up | Chartmint" },
  description:
    "Make beautiful charts online for free. Paste data from Excel or Sheets, pick a gorgeous palette, and download your chart as PNG or SVG. No account, no watermark lock-in.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Chartmint — Free Chart Maker, No Sign-Up",
    description:
      "Beautiful bar, line, pie, donut, area and scatter charts in seconds. Free, private, PNG & SVG export.",
    url: "/",
    siteName: "Chartmint",
    type: "website",
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chartmint — Free Chart Maker, No Sign-Up",
    description:
      "Beautiful bar, line, pie, donut, area and scatter charts in seconds. Free, private, PNG & SVG export.",
    images: ["/og/home.png"],
  },
};

const HOME_FAQ = [
  {
    q: "Is Chartmint really free?",
    a: "Yes — every chart type, every palette, and every export format (PNG, SVG, clipboard, share links) is free, with no account and no credit card. The small chartmint.app caption on charts can be switched off with one toggle.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Open the page, type or paste your data, download your chart. Your work is autosaved in your own browser so it’s still there when you come back — no login involved.",
  },
  {
    q: "Is my data private?",
    a: "Completely. Chartmint renders everything inside your browser; your numbers are never uploaded to a server. Even share links work without a server — the entire chart is compressed into the link itself.",
  },
  {
    q: "What chart types can I make?",
    a: "Bar graphs (vertical and horizontal, grouped or stacked), line graphs, area charts, pie charts, donut charts, and scatter plots. All of them share the same editor, so you can switch types with one click and keep your data.",
  },
  {
    q: "Can I use the charts commercially?",
    a: "Yes. Charts you create belong to you and can be used anywhere — business reports, articles, client work, social media, books. No attribution is required.",
  },
  {
    q: "How is Chartmint different from Excel or Canva?",
    a: "Speed and craft. There is no software to open and no account wall: you get a well-designed chart with curated palettes and clean typography in under a minute, and it exports at high resolution as PNG or true vector SVG.",
  },
];

const TYPE_BLURBS: Record<string, string> = {
  "bar-graph-maker": "Compare categories at a glance — grouped or stacked.",
  "horizontal-bar-chart-maker": "Rankings and long labels, perfectly readable.",
  "line-graph-maker": "Trends over time, one line per series.",
  "area-chart-maker": "Totals and their composition, beautifully stacked.",
  "pie-chart-maker": "Parts of a whole with automatic percentages.",
  "donut-chart-maker": "A modern pie with your total in the middle.",
  "scatter-plot-maker": "Correlations between two variables, dot by dot.",
};

export default function HomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Chartmint",
      url: SITE_URL,
      applicationCategory: "DesignApplication",
      operatingSystem: "Any (web browser)",
      description:
        "Free online chart maker. Create bar, line, pie, donut, area and scatter charts and export them as PNG or SVG — no sign-up.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
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
        <section className="pb-8 pt-10 text-center sm:pt-16">
          <h1 className="mx-auto max-w-3xl font-display text-[2.3rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[3.4rem]">
            Beautiful charts in seconds<span className="text-mint-600">.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-2 sm:text-[17px]">
            The free chart maker that skips the sign-up form. Paste your data,
            pick a palette, download a chart that looks designed — not defaulted.
          </p>
          <div className="mt-6">
            <TrustBadges />
          </div>
        </section>

        <Studio initialType="bar" />

        <section className="mt-20 grid gap-4 sm:grid-cols-3" aria-label="Why Chartmint">
          {[
            {
              title: "Zero friction",
              text: "No account, no download, no paywall between you and your chart. Open the page and start typing — your work autosaves in your browser.",
            },
            {
              title: "Designed, not defaulted",
              text: "Eight curated palettes, careful typography, honest axes. The defaults are the kind of chart you’d be proud to put in front of a client.",
            },
            {
              title: "Private by architecture",
              text: "Your data never leaves your device — rendering, exports, even share links are computed locally. Safe for numbers you can’t paste into random websites.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-card border border-line bg-card p-6 shadow-card">
              <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">
                {f.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-20" aria-labelledby="all-types">
          <h2 id="all-types" className="font-display text-[1.6rem] font-semibold tracking-tight text-ink">
            Every chart type, one editor
          </h2>
          <p className="mt-2 max-w-2xl text-[14.5px] text-ink-2">
            Each maker opens with a sensible example so you can see the chart working before you touch it.
            Your data follows you when you switch types.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MAKERS.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}`}
                className="group rounded-card border border-line bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-mint-500 hover:shadow-pop"
              >
                <h3 className="text-[15px] font-semibold text-ink group-hover:text-mint-700">
                  {m.h1}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
                  {TYPE_BLURBS[m.slug]}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="content mx-auto mt-20 max-w-3xl">
          <h2>Frequently asked questions</h2>
          <FaqList faq={HOME_FAQ} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
