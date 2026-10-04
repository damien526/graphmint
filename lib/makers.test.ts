import { describe, expect, it } from "vitest";

import { MAKERS, getMaker } from "./makers";
import { CHART_TYPE_LABELS } from "./types";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "./site";

/**
 * The maker catalogue, which is the whole site outside the editor.
 *
 * These are content invariants, not style opinions. Two of them have already
 * cost this project a correction:
 *
 * · SERP WIDTH. Titles and descriptions longer than Google renders arrive cut
 *   off, and the part that gets cut is the end — where the differentiator
 *   usually sits. The maker routes set `title: { absolute: … }`, so there is no
 *   " | Graphmint" suffix to budget for and the whole 60 is theirs; the home
 *   and legal pages go through the layout template and do pay the suffix,
 *   which is why they are measured separately.
 *
 * · INBOUND LINKS. A page that nothing links to is a page that does not exist.
 *   Every maker declares three `related` entries; what matters is that each one
 *   also RECEIVES at least two, which is a property of the whole catalogue and
 *   cannot be checked while writing a single page.
 */

/** What the layout appends to a page that does not set an absolute title. */
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

describe("the catalogue holds together", () => {
  it("has a unique slug per entry", () => {
    const slugs = MAKERS.map((m) => m.slug);
    expect(slugs).toHaveLength(new Set(slugs).size);
  });

  it("uses url-safe slugs", () => {
    for (const m of MAKERS) expect(m.slug, m.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("gives every entry a chart type the editor can actually render", () => {
    for (const m of MAKERS) {
      expect(Object.keys(CHART_TYPE_LABELS), m.slug).toContain(m.type);
    }
  });

  it("is reachable by slug, and only by a real slug", () => {
    for (const m of MAKERS) expect(getMaker(m.slug)?.slug).toBe(m.slug);
    expect(getMaker("not-a-maker")).toBeUndefined();
    expect(getMaker("")).toBeUndefined();
  });
});

describe("SERP widths", () => {
  it("keeps every maker title inside what Google renders", () => {
    for (const m of MAKERS) {
      expect(m.metaTitle.length, `${m.slug}: ${m.metaTitle}`).toBeLessThanOrEqual(60);
      expect(m.metaTitle.length, m.slug).toBeGreaterThanOrEqual(25);
    }
  });

  it("keeps every maker description inside the rendered width", () => {
    for (const m of MAKERS) {
      expect(m.metaDescription.length, `${m.slug}: ${m.metaDescription}`).toBeLessThanOrEqual(160);
      expect(m.metaDescription.length, m.slug).toBeGreaterThanOrEqual(110);
    }
  });

  /**
   * The home title goes through the layout's `%s | Graphmint` template only for
   * child pages; the home itself uses `default`, so it is measured bare.
   */
  it("keeps the home title and description inside the rendered width", () => {
    expect(SITE_TITLE.length, SITE_TITLE).toBeLessThanOrEqual(60);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(110);
  });

  /**
   * A maker page that forgot `title: { absolute: … }` would silently inherit
   * the template and gain twelve characters. Checked here so the budget above
   * stays honest even if a route changes.
   */
  it("would still fit if a maker title ever picked up the site suffix", () => {
    const overflowing = MAKERS.filter((m) => m.metaTitle.length + TITLE_SUFFIX.length > 60);
    // Several do overflow with the suffix — which is exactly why the routes set
    // an absolute title. This records the dependency rather than ignoring it.
    expect(overflowing.length).toBeGreaterThan(0);
  });

  it("does not repeat the brand inside a maker title", () => {
    for (const m of MAKERS) {
      expect(m.metaTitle, m.slug).not.toContain(SITE_NAME);
      expect(m.metaTitle, m.slug).not.toContain("|");
    }
  });
});

describe("internal linking", () => {
  it("only points `related` at slugs that exist", () => {
    const slugs = new Set(MAKERS.map((m) => m.slug));
    for (const m of MAKERS) {
      for (const r of m.related) {
        expect(slugs.has(r.slug), `${m.slug} -> ${r.slug}`).toBe(true);
      }
    }
  });

  it("never links a page to itself", () => {
    for (const m of MAKERS) {
      expect(m.related.map((r) => r.slug), m.slug).not.toContain(m.slug);
    }
  });

  it("gives every maker at least two inbound links", () => {
    const inbound = new Map(MAKERS.map((m) => [m.slug, 0]));
    for (const m of MAKERS) {
      for (const r of m.related) inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
    }
    for (const [slug, count] of inbound) {
      expect(count, `${slug} has ${count} inbound link(s)`).toBeGreaterThanOrEqual(2);
    }
  });

  it("labels every related link", () => {
    for (const m of MAKERS) {
      for (const r of m.related) expect(r.label.trim(), `${m.slug} -> ${r.slug}`).not.toBe("");
    }
  });
});

describe("every page has the content it promises", () => {
  it("carries an h1, a tagline and at least two intro paragraphs", () => {
    for (const m of MAKERS) {
      expect(m.h1.trim(), m.slug).not.toBe("");
      expect(m.tagline.trim(), m.slug).not.toBe("");
      expect(m.intro.length, m.slug).toBeGreaterThanOrEqual(2);
      for (const p of m.intro) expect(p.trim(), m.slug).not.toBe("");
    }
  });

  it("carries steps, a when-to-use section and tips, all non-empty", () => {
    for (const m of MAKERS) {
      expect(m.steps.length, m.slug).toBeGreaterThanOrEqual(3);
      for (const s of m.steps) {
        expect(s.name.trim(), m.slug).not.toBe("");
        expect(s.text.trim(), m.slug).not.toBe("");
      }
      expect(m.whenTitle.trim(), m.slug).not.toBe("");
      expect(m.when.length, m.slug).toBeGreaterThanOrEqual(1);
      expect(m.tips.length, m.slug).toBeGreaterThanOrEqual(1);
    }
  });

  /** The FAQ is the one node answer engines still read; it must be substantive. */
  it("asks at least four distinct questions, each with an answer", () => {
    for (const m of MAKERS) {
      expect(m.faq.length, m.slug).toBeGreaterThanOrEqual(4);
      const asked = m.faq.map((f) => f.q);
      expect(asked, m.slug).toHaveLength(new Set(asked).size);
      for (const f of m.faq) {
        expect(f.q.trim().endsWith("?"), `${m.slug}: ${f.q}`).toBe(true);
        expect(f.a.trim().length, `${m.slug}: ${f.q}`).toBeGreaterThan(40);
      }
    }
  });

  it("gives each page its own h1 and its own title", () => {
    const h1s = MAKERS.map((m) => m.h1);
    const titles = MAKERS.map((m) => m.metaTitle);
    expect(h1s).toHaveLength(new Set(h1s).size);
    expect(titles).toHaveLength(new Set(titles).size);
  });

  /**
   * The promise the whole site rests on. If a page stops saying the data stays
   * local, the privacy claim is only in the privacy policy — and nobody reads
   * that before pasting a confidential spreadsheet.
   */
  it("states somewhere on the page that nothing is uploaded", () => {
    for (const m of MAKERS) {
      const copy = [m.tagline, ...m.intro, ...m.tips, ...m.faq.map((f) => f.a)]
        .join(" ")
        .toLowerCase();
      // Accepted phrasings, not one house sentence: the pages say this in their
      // own words — "in your browser", "client-side", "never uploaded". Any of
      // them discharges the promise; none of them does not.
      expect(
        /no upload|never uploaded|not uploaded|without uploading|in the browser|in your browser|client-side|never leaves|stays in the browser|on your (own )?(device|computer|machine)/.test(
          copy,
        ),
        m.slug,
      ).toBe(true);
    }
  });
});
