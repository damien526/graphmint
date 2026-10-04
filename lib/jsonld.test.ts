import { describe, expect, it } from "vitest";

import { MAKERS } from "./makers";
import {
  APP_ID,
  ORG_ID,
  PERSON_ID,
  WEBSITE_ID,
  contentPageGraph,
  homeGraph,
  jsonLdGraph,
  makerGraph,
} from "./jsonld";
import { CONTENT_REVIEWED_ON, PUBLISHER_LINKEDIN, SITE_URL, absoluteUrl } from "./site";

/**
 * The structured data, checked node by node.
 *
 * THE TEST THAT MATTERS is "no dangling reference". JSON-LD is read one page at
 * a time: a page that writes `publisher: { '@id': '…/#org' }` without
 * declaring the `#org` node in the same document produces a link to nothing.
 * Nothing reports it — not the build, not the browser, not the validators that
 * only check syntax. The mistake is a forgotten `...siteGraph()` while adding a
 * page, and it costs the site its entity, which stops being connected.
 *
 * The rest are of the same kind: they do not judge whether a schema choice is
 * wise, they establish that it holds together.
 */

type Node = Record<string, unknown>;

const HOME_FAQ = [
  { q: "Is Graphmint free?", a: "Yes." },
  { q: "Do I need an account?", a: "No." },
];

/** Every page's graph, named so a failure says which one. */
const GRAPHS: { name: string; url: string; crumbs: boolean; nodes: Node[] }[] = [
  { name: "home", url: absoluteUrl("/"), crumbs: false, nodes: homeGraph(HOME_FAQ) },
  ...MAKERS.map((maker) => ({
    name: maker.slug,
    url: absoluteUrl(`/${maker.slug}`),
    crumbs: true,
    nodes: makerGraph(maker),
  })),
  ...(["privacy", "terms"] as const).map((slug) => ({
    name: slug,
    url: absoluteUrl(`/${slug}`),
    crumbs: true,
    nodes: contentPageGraph({
      url: absoluteUrl(`/${slug}`),
      name: slug,
      description: "x",
      crumb: slug,
    }),
  })),
];

/** Every `@id` a graph declares. */
function declaredIds(nodes: Node[]): Set<string> {
  return new Set(
    nodes.map((n) => n["@id"]).filter((id): id is string => typeof id === "string"),
  );
}

/** Every `@id` a graph cites, found at any depth. */
function referencedIds(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const v of value) referencedIds(v, out);
  } else if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o);
    // A bare `{ '@id': … }` is a reference; a node that also carries `@type`
    // is a declaration and its own `@id` is not a citation of anything.
    if (keys.length === 1 && typeof o["@id"] === "string") out.push(o["@id"]);
    for (const [k, v] of Object.entries(o)) {
      if (k === "@id") continue;
      referencedIds(v, out);
    }
  }
  return out;
}

function typesOf(nodes: Node[]): string[] {
  return nodes.map((n) => String(n["@type"]));
}

describe("graph integrity", () => {
  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — every referenced @id is declared in the same document",
    (_name, g) => {
      const declared = declaredIds(g.nodes);
      const dangling = referencedIds(g.nodes).filter((id) => !declared.has(id));
      expect([...new Set(dangling)]).toEqual([]);
    },
  );

  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — repeats the WebSite / Organization / Person base",
    (_name, g) => {
      const declared = declaredIds(g.nodes);
      expect(declared.has(WEBSITE_ID)).toBe(true);
      expect(declared.has(ORG_ID)).toBe(true);
      expect(declared.has(PERSON_ID)).toBe(true);
    },
  );

  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — declares no @id twice",
    (_name, g) => {
      const ids = g.nodes
        .map((n) => n["@id"])
        .filter((id): id is string => typeof id === "string");
      expect(ids).toHaveLength(new Set(ids).size);
    },
  );

  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — declares exactly one WebPage, carrying the page's own URL",
    (_name, g) => {
      const pages = g.nodes.filter((n) => n["@type"] === "WebPage");
      expect(pages).toHaveLength(1);
      expect(pages[0].url).toBe(g.url);
    },
  );

  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — has a breadcrumb exactly when it should",
    (_name, g) => {
      const crumbs = g.nodes.filter((n) => n["@type"] === "BreadcrumbList");
      expect(crumbs).toHaveLength(g.crumbs ? 1 : 0);
      // A WebPage may only point at a breadcrumb that exists.
      const page = g.nodes.find((n) => n["@type"] === "WebPage")!;
      expect("breadcrumb" in page).toBe(g.crumbs);
    },
  );

  it.each(GRAPHS.map((g) => [g.name, g] as const))(
    "%s — every @id is absolute and on this origin",
    (_name, g) => {
      for (const id of declaredIds(g.nodes)) {
        expect(id.startsWith(SITE_URL), id).toBe(true);
      }
    },
  );
});

describe("the application is one entity, not one per page", () => {
  it("uses the same @id wherever it is described", () => {
    const appNodes = GRAPHS.flatMap((g) =>
      g.nodes.filter((n) => n["@type"] === "WebApplication"),
    );
    expect(appNodes.length).toBeGreaterThan(1);
    for (const n of appNodes) expect(n["@id"]).toBe(APP_ID);
  });

  it("names the product, not the page title", () => {
    const app = homeGraph(HOME_FAQ).find((n) => n["@type"] === "WebApplication")!;
    expect(String(app.name)).not.toContain("|");
  });
});

/**
 * Guards the September-2023 removal documented in `jsonld.ts`.
 *
 * Google withdrew the how-to rich result, so the node renders nothing for
 * anyone. It was emitted on all seven maker pages. If someone reinstates it
 * from a sibling project or an old branch, this fails rather than quietly
 * shipping payload again.
 */
describe("no dead markup", () => {
  it("emits no HowTo or HowToStep node anywhere", () => {
    const all = GRAPHS.flatMap((g) => JSON.stringify(g.nodes));
    for (const json of all) {
      expect(json).not.toContain("HowTo");
    }
  });

  it("still renders the steps as content, which is where they belong", () => {
    for (const maker of MAKERS) {
      expect(maker.steps.length, maker.slug).toBeGreaterThan(0);
    }
  });
});

describe("maker pages", () => {
  it("declare an FAQPage whose questions match the page's own FAQ", () => {
    for (const maker of MAKERS) {
      const faq = makerGraph(maker).find((n) => n["@type"] === "FAQPage");
      expect(faq, maker.slug).toBeDefined();
      const asked = (faq!.mainEntity as { name: string }[]).map((q) => q.name);
      expect(asked).toEqual(maker.faq.map((f) => f.q));
    }
  });

  it("trail home then themselves, in that order", () => {
    for (const maker of MAKERS) {
      const crumb = makerGraph(maker).find((n) => n["@type"] === "BreadcrumbList")!;
      const items = crumb.itemListElement as { position: number; item: string }[];
      expect(items).toHaveLength(2);
      expect(items[0].item).toBe(absoluteUrl("/"));
      expect(items[1].item).toBe(absoluteUrl(`/${maker.slug}`));
      expect(items.map((i) => i.position)).toEqual([1, 2]);
    }
  });

  it("date themselves from the content review, never the build clock", () => {
    for (const maker of MAKERS) {
      const page = makerGraph(maker).find((n) => n["@type"] === "WebPage")!;
      expect(page.dateModified, maker.slug).toBe(CONTENT_REVIEWED_ON);
    }
  });

  it("point at a social card that matches the slug", () => {
    for (const maker of MAKERS) {
      const page = makerGraph(maker).find((n) => n["@type"] === "WebPage")!;
      const image = page.primaryImageOfPage as { url: string } | undefined;
      expect(String(image?.url), maker.slug).toContain(`/og/${maker.slug}.png`);
    }
  });
});

describe("the publisher", () => {
  it("declares sameAs on Person only, with the one profile that exists", () => {
    const nodes = homeGraph(HOME_FAQ);
    const person = nodes.find((n) => n["@id"] === PERSON_ID)!;
    const org = nodes.find((n) => n["@id"] === ORG_ID)!;
    expect(person.sameAs).toEqual([PUBLISHER_LINKEDIN]);
    expect("sameAs" in org).toBe(false);
  });

  it("links Organization and Person in both directions", () => {
    const nodes = homeGraph(HOME_FAQ);
    const person = nodes.find((n) => n["@id"] === PERSON_ID)!;
    const org = nodes.find((n) => n["@id"] === ORG_ID)!;
    expect(person.worksFor).toEqual({ "@id": ORG_ID });
    expect(org.founder).toEqual({ "@id": PERSON_ID });
  });
});

describe("jsonLdGraph", () => {
  it("wraps the nodes in one @context and one @graph", () => {
    const parsed = JSON.parse(jsonLdGraph(homeGraph(HOME_FAQ)));
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(typesOf(parsed["@graph"])).toContain("WebSite");
  });

  it("escapes anything that could close the script element early", () => {
    const out = jsonLdGraph([{ "@type": "Thing", name: "</script><script>alert(1)" }]);
    expect(out).not.toContain("</script");
    // Still valid JSON once escaped.
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("round-trips to the same nodes it was given", () => {
    const nodes = makerGraph(MAKERS[0]);
    expect(JSON.parse(jsonLdGraph(nodes))["@graph"]).toEqual(JSON.parse(JSON.stringify(nodes)));
  });
});
