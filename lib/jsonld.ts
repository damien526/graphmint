/**
 * Structured data for the site.
 *
 * ⚠ THE RULE THIS FILE EXISTS FOR — JSON-LD is read one page at a time. An
 * `@id` declared elsewhere does not exist: a page that writes
 * `publisher: { '@id': '…/#org' }` without declaring the `#org` node in the
 * same document produces a dangling reference, which engines drop in silence.
 * The `#website` / `#org` / `#person` base is therefore REPEATED ON EVERY
 * PAGE — that is what `siteGraph()` is for. Never "factor it out" to one page.
 *
 * The previous markup had the opposite problem: each of the eight maker pages
 * declared its own anonymous `WebApplication`, so eight distinct applications
 * were described where there is one. One `@id` fixes that; page specificity
 * now lives in the `WebPage` and the `BreadcrumbList`, which is where it
 * belongs.
 *
 * `@id` NAMING CONVENTION:
 *   · global entities → fragment on the root     `/#website`, `/#org`, `/#person`
 *   · per-page nodes  → fragment on the page URL `/bar-graph-maker#page`
 */
import type { MakerPage } from "./makers";
import {
  CONTENT_REVIEWED_ON,
  PUBLISHER_EMAIL,
  PUBLISHER_LINKEDIN,
  PUBLISHER_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  ogImageUrl,
} from "./site";

export const WEBSITE_ID = absoluteUrl("/#website");
export const ORG_ID = absoluteUrl("/#org");
export const PERSON_ID = absoluteUrl("/#person");
/** One application, one identifier, whichever page describes it. */
export const APP_ID = absoluteUrl("/#app");

/** The page that names the operator, as the law requires it to. */
const PUBLISHER_PAGE = absoluteUrl("/terms");

type Node = Record<string, unknown>;

const ref = (id: string) => ({ "@id": id });

const breadcrumbId = (url: string) => `${url}#breadcrumb`;

/**
 * The site, its publisher, and the person behind it. Three identical nodes on
 * every page: this is what lets an engine resolve the brand as one stable
 * entity rather than as a pile of unrelated pages.
 *
 * `sameAs` is declared on `Person` only, and carries one address: the
 * operator's LinkedIn profile, which exists. `Organization` has none — the
 * site has no company page, and a personal profile is not one. An invented
 * `sameAs` points at nothing and damages the entity instead of strengthening it.
 */
export function siteGraph(): Node[] {
  return [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: absoluteUrl("/"),
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: ref(ORG_ID),
    },
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: absoluteUrl("/"),
      email: PUBLISHER_EMAIL,
      // Reciprocal of `Person.worksFor` below: both directions are declared,
      // or the link only holds one way.
      founder: ref(PERSON_ID),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon-512.png"),
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: PUBLISHER_NAME,
      // /terms is the page that names the operator: the only verifiable
      // address for this entity on the site.
      url: PUBLISHER_PAGE,
      email: PUBLISHER_EMAIL,
      sameAs: [PUBLISHER_LINKEDIN],
      worksFor: ref(ORG_ID),
    },
  ];
}

/**
 * What the tool does, for an engine. The list is capabilities that are real
 * and checkable on the page; it is not a sales pitch.
 */
const FEATURE_LIST = [
  "Bar, horizontal bar, line, area, pie, donut and scatter charts in one editor",
  "Paste tabular data straight from Excel or Google Sheets",
  "Eight curated colour palettes, light, cream or dark canvas",
  "PNG download, true vector SVG download, and copy to clipboard",
  "Share links that carry the whole chart in the URL, with no server state",
  "Runs entirely in the browser: data is never uploaded",
];

/**
 * The application itself — ONE node for the whole site, with a stable `@id`.
 *
 * `name` is the product name, not the page title: a schema entity called
 * "Bar Graph Maker | Graphmint" describes a page, and that pipe is a title
 * separator that has no business inside an entity name.
 */
export function webApplication(): Node {
  return {
    "@type": "WebApplication",
    "@id": APP_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    screenshot: ogImageUrl(),
    image: ogImageUrl(),
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: FEATURE_LIST,
    isPartOf: ref(WEBSITE_ID),
    publisher: ref(ORG_ID),
    author: ref(PERSON_ID),
  };
}

/**
 * The document itself — one node per page, and only one.
 *
 * It carries `dateModified`, which is its main reason for existing: the
 * sitemap dates the content to `CONTENT_REVIEWED_ON` and the markup said so
 * nowhere.
 *
 * The type stays `WebPage` even on pages that carry an FAQ. The two nodes are
 * deliberately separate: `FAQPage` is the markup Google stopped displaying in
 * 2023 and may stop reading, `WebPage` carries the durable signals. Housing
 * them together would make the second depend on the first.
 */
export function webPage({
  url,
  name,
  description,
  slug,
  mainEntity,
  hasBreadcrumb,
}: {
  url: string;
  name: string;
  description: string;
  slug?: string;
  mainEntity?: string;
  hasBreadcrumb?: boolean;
}): Node {
  return {
    "@type": "WebPage",
    "@id": `${url}#page`,
    url,
    name,
    description,
    inLanguage: "en",
    dateModified: CONTENT_REVIEWED_ON,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImageUrl(slug),
      width: 1200,
      height: 630,
    },
    isPartOf: ref(WEBSITE_ID),
    ...(mainEntity ? { mainEntity: ref(mainEntity) } : {}),
    ...(hasBreadcrumb ? { breadcrumb: ref(breadcrumbId(url)) } : {}),
    publisher: ref(ORG_ID),
  };
}

/**
 * The visible FAQ, word for word.
 *
 * The text must match what the reader sees exactly — that is the validity
 * condition Google sets, and the reason `FaqList` is not an accordion.
 */
export function faqPage(url: string, items: readonly { q: string; a: string }[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: "en",
    isPartOf: ref(WEBSITE_ID),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/*
 * No `HowTo` node here, deliberately.
 *
 * Google removed the how-to rich result from Search in September 2023 — not
 * restricted it, removed it. The markup renders nothing, for anyone. It used to
 * wrap `maker.steps` on all seven maker pages, which is seven `HowTo` nodes and
 * their `HowToStep` children of payload buying a SERP feature that no longer
 * exists.
 *
 * `maker.steps` is NOT dead with it: the steps are still written in
 * `lib/makers.ts`, still rendered by `MakerLanding`, and still the part of the
 * page a reader actually follows. What is gone is the duplicate copy of them in
 * the graph.
 *
 * Do not reinstate this without first checking that Google has brought the
 * feature back. `FAQPage` stays, for the reason spelled out above its own
 * function: its rich result is equally gone, but it is read by answer engines,
 * and being quoted correctly by one is this site's main road in.
 */

export function breadcrumb(url: string, trail: { name: string; url: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(url),
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: step.url,
    })),
  };
}

export const HOME_CRUMB = { name: SITE_NAME, url: absoluteUrl("/") };

/* -------------------------------------------------------------------------- */
/*                          One graph per page shape                          */
/* -------------------------------------------------------------------------- */

/** Home: the base, the document, the application. No breadcrumb at the root. */
export function homeGraph(faq: readonly { q: string; a: string }[]): Node[] {
  const url = absoluteUrl("/");
  return [
    ...siteGraph(),
    webPage({
      url,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      mainEntity: APP_ID,
    }),
    webApplication(),
    faqPage(url, faq),
  ];
}

/** A maker page: document, FAQ, breadcrumb, and the base. */
export function makerGraph(maker: MakerPage): Node[] {
  const url = absoluteUrl(`/${maker.slug}`);
  return [
    ...siteGraph(),
    webPage({
      url,
      name: maker.h1,
      description: maker.metaDescription,
      slug: maker.slug,
      mainEntity: APP_ID,
      hasBreadcrumb: true,
    }),
    webApplication(),
    faqPage(url, maker.faq),
    breadcrumb(url, [HOME_CRUMB, { name: maker.h1, url }]),
  ];
}

/** An ordinary page outside the catalogue — privacy and terms, today. */
export function contentPageGraph({
  url,
  name,
  description,
  crumb,
}: {
  url: string;
  name: string;
  description: string;
  crumb: string;
}): Node[] {
  return [
    ...siteGraph(),
    webPage({ url, name, description, hasBreadcrumb: true }),
    breadcrumb(url, [HOME_CRUMB, { name: crumb, url }]),
  ];
}

/**
 * Wraps a page's nodes in a single `@graph` and returns the string to drop
 * into the `<script>`. One `@context`, one block: nodes can cite each other by
 * `@id` with nothing dangling.
 */
export function jsonLdGraph(nodes: Node[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(
    /</g,
    "\\u003c",
  );
}
