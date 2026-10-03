export const SITE_URL = "https://www.graphmint.app";
export const SITE_NAME = "Graphmint";

export const SITE_TITLE = "Graphmint: Free Chart Maker, No Sign-Up";

export const SITE_DESCRIPTION =
  "Make beautiful charts online in seconds. Free chart maker with no sign-up: paste your data, pick a style, download as PNG or SVG.";

/**
 * Who operates the site.
 *
 * These three values already appear in the copy: /terms and /privacy name the
 * operator and carry the contact address, as the law requires. The structured
 * data reads them from here so the two can't drift — and so the `sameAs` below
 * points at a profile that exists rather than at a plausible-looking URL.
 */
export const PUBLISHER_NAME = "Damien Yvert";

export const PUBLISHER_EMAIL = "damienyvert.dev@gmail.com";

/** The operator's only public profile, and so the graph's only `sameAs`. */
export const PUBLISHER_LINKEDIN = "https://www.linkedin.com/in/damien-yvert/";

/**
 * When the content last actually changed.
 *
 * This — not the build clock — is what the sitemap's `lastmod` and the
 * markup's `dateModified` carry. A clock date claims every page changed on
 * every push, including the pushes that didn't touch a line of copy, and a
 * sitemap that cries wolf ends up with its `lastmod` ignored. Then the day a
 * page really does change, the signal no longer carries.
 *
 * ⚠ Advance this by hand, and only when copy or the maker catalogue changes.
 * A styling tweak, a build fix or a component rename leave it alone.
 */
export const CONTENT_REVIEWED_ON = "2026-10-03";

/** Absolute URL for an internal path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Social card for a page — the home card when the slug is omitted. */
export function ogImageUrl(slug?: string): string {
  return absoluteUrl(`/og/${slug ?? "home"}.png`);
}
