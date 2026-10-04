import { describe, expect, it } from "vitest";

import { PALETTES } from "./palettes";
import { parseDelimited, sampleSpec, sanitizeSpec, toNumber } from "./data";
import { DEFAULT_OPTIONS } from "./types";
import type { ChartType } from "./types";

/**
 * The data layer, which is where this tool's two trust boundaries live.
 *
 * THE TESTS THAT MATTER are the `sanitizeSpec` ones. A chart arrives from a
 * share-link hash or from localStorage — both of them attacker-writable — and
 * is then fed straight into the renderer, which indexes `values` against
 * `labels` and reads `options` to pick colours and layout. A spec that lies
 * about its own shape (series longer than labels, a `fontScale` of 9000, a
 * `background` that no theme defines) does not fail loudly; it renders wrong,
 * or throws deep inside an SVG path builder. `sanitizeSpec` is the only thing
 * standing between the two, so its clamps are asserted here one by one rather
 * than assumed.
 *
 * `parseDelimited` and `toNumber` are the other boundary: a paste from Excel or
 * Sheets. They are deliberately tolerant — thousands separators, currency
 * symbols, European decimal commas — and tolerance is exactly the kind of thing
 * that rots silently, so the accepted forms are pinned.
 */

const CHART_TYPES: ChartType[] = [
  "bar",
  "bar-horizontal",
  "line",
  "area",
  "pie",
  "donut",
  "scatter",
];

/** A spec that should survive sanitising untouched, as a baseline to mutate. */
function validSpec() {
  return {
    type: "bar",
    data: {
      labels: ["Q1", "Q2"],
      series: [{ name: "Product A", values: [1, 2] }],
    },
    options: { ...DEFAULT_OPTIONS },
  };
}

describe("sanitizeSpec — rejects what cannot be rendered", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a string", "bar"],
    ["a number", 42],
    ["an array", []],
  ])("returns null for %s", (_label, raw) => {
    expect(sanitizeSpec(raw)).toBeNull();
  });

  it("returns null for an unknown chart type", () => {
    expect(sanitizeSpec({ ...validSpec(), type: "pyramid" })).toBeNull();
    expect(sanitizeSpec({ ...validSpec(), type: "" })).toBeNull();
  });

  it("returns null when labels or series are not arrays", () => {
    expect(sanitizeSpec({ ...validSpec(), data: { labels: "Q1", series: [] } })).toBeNull();
    expect(sanitizeSpec({ ...validSpec(), data: { labels: [], series: {} } })).toBeNull();
    expect(sanitizeSpec({ ...validSpec(), data: undefined })).toBeNull();
  });

  it("returns null when there is no series at all", () => {
    expect(sanitizeSpec({ ...validSpec(), data: { labels: ["Q1"], series: [] } })).toBeNull();
  });

  it("accepts every chart type the editor offers", () => {
    for (const type of CHART_TYPES) {
      expect(sanitizeSpec({ ...validSpec(), type })?.type, type).toBe(type);
    }
  });
});

describe("sanitizeSpec — clamps a hostile spec to a renderable one", () => {
  it("caps labels at 500 rows", () => {
    const labels = Array.from({ length: 900 }, (_, i) => `row ${i}`);
    const spec = sanitizeSpec({
      ...validSpec(),
      data: { labels, series: [{ name: "S", values: labels.map(() => 1) }] },
    });
    expect(spec?.data.labels).toHaveLength(500);
  });

  it("caps series at 12", () => {
    const series = Array.from({ length: 40 }, (_, i) => ({ name: `S${i}`, values: [1] }));
    const spec = sanitizeSpec({ ...validSpec(), data: { labels: ["a"], series } });
    expect(spec?.data.series).toHaveLength(12);
  });

  it("truncates over-long label and series names", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      data: {
        labels: ["L".repeat(400)],
        series: [{ name: "N".repeat(400), values: [1] }],
      },
    });
    expect(spec?.data.labels[0]).toHaveLength(200);
    expect(spec?.data.series[0].name).toHaveLength(120);
  });

  /**
   * The invariant the renderer depends on: every series carries exactly one
   * value per label. Short series are padded with null, long ones are cut. Get
   * this wrong and a bar chart reads values off the end of its own data.
   */
  it("pads short series and truncates long ones to the label count", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      data: {
        labels: ["a", "b", "c"],
        series: [
          { name: "short", values: [1] },
          { name: "long", values: [1, 2, 3, 4, 5, 6] },
        ],
      },
    });
    expect(spec?.data.series[0].values).toEqual([1, null, null]);
    expect(spec?.data.series[1].values).toEqual([1, 2, 3]);
    for (const s of spec!.data.series) {
      expect(s.values).toHaveLength(spec!.data.labels.length);
    }
  });

  it("replaces non-finite and non-numeric values with null", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      data: {
        labels: ["a", "b", "c", "d", "e"],
        series: [{ name: "S", values: [1, "2", NaN, Infinity, null] }],
      },
    });
    // "2" is a string, not a number: the renderer must not have to coerce.
    expect(spec?.data.series[0].values).toEqual([1, null, null, null, null]);
  });

  it("names an unnamed series by its position", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      data: { labels: ["a"], series: [{ values: [1] }, { values: [2] }] },
    });
    expect(spec?.data.series.map((s) => s.name)).toEqual(["Series 1", "Series 2"]);
  });

  it("coerces missing labels to strings rather than leaving holes", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      data: { labels: [null, undefined, 7], series: [{ name: "S", values: [1, 2, 3] }] },
    });
    expect(spec?.data.labels).toEqual(["", "", "7"]);
  });
});

describe("sanitizeSpec — options fall back instead of passing through", () => {
  it("falls back to defaults when options are absent entirely", () => {
    const { options: _drop, ...rest } = validSpec();
    expect(sanitizeSpec(rest)?.options).toEqual(DEFAULT_OPTIONS);
  });

  it.each([
    ["background", "chartreuse", DEFAULT_OPTIONS.background],
    ["legend", "sideways", DEFAULT_OPTIONS.legend],
    ["aspect", "cinemascope", DEFAULT_OPTIONS.aspect],
    ["fontScale", 9000, DEFAULT_OPTIONS.fontScale],
  ])("rejects an out-of-enum %s and uses the default", (key, bad, expected) => {
    const spec = sanitizeSpec({ ...validSpec(), options: { [key]: bad } });
    expect(spec?.options[key as "background"]).toBe(expected);
  });

  it("only accepts a palette id that exists", () => {
    expect(sanitizeSpec({ ...validSpec(), options: { palette: "mint" } })?.options.palette).toBe(
      "mint",
    );
    expect(
      sanitizeSpec({ ...validSpec(), options: { palette: "not-a-palette" } })?.options.palette,
    ).toBe(DEFAULT_OPTIONS.palette);
    // The default must itself be a real palette, or every fallback is broken.
    expect(PALETTES.some((p) => p.id === DEFAULT_OPTIONS.palette)).toBe(true);
  });

  it("ignores a non-boolean where a boolean is expected", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      options: { showGrid: "yes", stacked: 1, watermark: null },
    });
    expect(spec?.options.showGrid).toBe(DEFAULT_OPTIONS.showGrid);
    expect(spec?.options.stacked).toBe(DEFAULT_OPTIONS.stacked);
    expect(spec?.options.watermark).toBe(DEFAULT_OPTIONS.watermark);
  });

  it("truncates over-long text options", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      options: { title: "T".repeat(500), subtitle: "S".repeat(500), xLabel: "X".repeat(500) },
    });
    expect(spec?.options.title).toHaveLength(200);
    expect(spec?.options.subtitle).toHaveLength(300);
    expect(spec?.options.xLabel).toHaveLength(120);
  });

  it("never emits an option key the renderer does not know", () => {
    const spec = sanitizeSpec({
      ...validSpec(),
      options: { ...DEFAULT_OPTIONS, __proto__: { polluted: true }, extra: "dropped" },
    });
    expect(Object.keys(spec!.options).sort()).toEqual(Object.keys(DEFAULT_OPTIONS).sort());
  });
});

describe("sampleSpec", () => {
  it("returns a spec that survives its own sanitiser, for every type", () => {
    for (const type of CHART_TYPES) {
      const spec = sampleSpec(type);
      expect(sanitizeSpec(JSON.parse(JSON.stringify(spec))), type).not.toBeNull();
    }
  });

  it("gives every series one value per label", () => {
    for (const type of CHART_TYPES) {
      const spec = sampleSpec(type);
      for (const s of spec.data.series) {
        expect(s.values.length, `${type}/${s.name}`).toBe(spec.data.labels.length);
      }
    }
  });

  it("honours the requested type, except that an unknown one falls back to bar", () => {
    for (const type of CHART_TYPES) expect(sampleSpec(type).type).toBe(type);
    expect(sampleSpec("nonsense" as ChartType).type).toBe("bar");
  });

  it("carries a title for every type, since the canvas renders one", () => {
    for (const type of CHART_TYPES) {
      expect(sampleSpec(type).options.title, type).not.toBe("");
    }
  });
});

describe("toNumber — tolerant parsing of a spreadsheet paste", () => {
  it.each([
    ["42", 42],
    ["  42  ", 42],
    ["-7", -7],
    ["3.5", 3.5],
    ["1,234.5", 1234.5], // en-US thousands + decimal point
    ["1.234,5", 1234.5], // de/fr thousands + decimal comma
    ["1234,5", 1234.5], // bare decimal comma
    ["1,234", 1234], // three digits after the comma reads as thousands
    ["1,23", 1.23], // two digits reads as a decimal
    ["42%", 42],
    ["$1.2", 1.2],
    ["€15", 15],
    ["£20", 20],
    ["1 234", 1234], // thin/plain space as a thousands separator
  ])("parses %j as %f", (raw, expected) => {
    expect(toNumber(raw)).toBe(expected);
  });

  it.each([
    ["", null],
    ["   ", null],
    ["abc", null],
    ["--", null],
    [undefined, null],
  ])("returns null for %j", (raw, expected) => {
    expect(toNumber(raw as string | undefined)).toBe(expected);
  });
});

describe("parseDelimited", () => {
  it("returns null for empty or unusable input", () => {
    expect(parseDelimited("")).toBeNull();
    expect(parseDelimited("   \n  ")).toBeNull();
    // A single column has labels but nothing to plot.
    expect(parseDelimited("Q1\nQ2\nQ3")).toBeNull();
  });

  it("reads a header row and names the series from it", () => {
    const d = parseDelimited("Quarter,Product A,Product B\nQ1,38,24\nQ2,52,30");
    expect(d?.labels).toEqual(["Q1", "Q2"]);
    expect(d?.series.map((s) => s.name)).toEqual(["Product A", "Product B"]);
    expect(d?.series[0].values).toEqual([38, 52]);
    expect(d?.series[1].values).toEqual([24, 30]);
  });

  it("falls back to positional names when there is no header", () => {
    const d = parseDelimited("Q1,38,24\nQ2,52,30");
    expect(d?.labels).toEqual(["Q1", "Q2"]);
    expect(d?.series.map((s) => s.name)).toEqual(["Series 1", "Series 2"]);
  });

  /** A paste straight out of Excel or Sheets is tab-separated, not comma. */
  it("detects tabs in preference to commas", () => {
    const d = parseDelimited("Quarter\tSales\nQ1\t1,234\nQ2\t2,500");
    expect(d?.series[0].name).toBe("Sales");
    expect(d?.series[0].values).toEqual([1234, 2500]);
  });

  it("detects semicolons when there is no comma", () => {
    const d = parseDelimited("Quarter;Sales\nQ1;10\nQ2;20");
    expect(d?.labels).toEqual(["Q1", "Q2"]);
    expect(d?.series[0].values).toEqual([10, 20]);
  });

  it("honours quoted cells, including an embedded delimiter and escaped quote", () => {
    const d = parseDelimited('Label,Value\n"Smith, John",10\n"He said ""hi""",20');
    expect(d?.labels).toEqual(["Smith, John", 'He said "hi"']);
    expect(d?.series[0].values).toEqual([10, 20]);
  });

  it("accepts CRLF and bare CR line endings", () => {
    expect(parseDelimited("Q,V\r\nQ1,1\r\nQ2,2")?.labels).toEqual(["Q1", "Q2"]);
    expect(parseDelimited("Q,V\rQ1,1\rQ2,2")?.labels).toEqual(["Q1", "Q2"]);
  });

  it("skips blank lines rather than emitting empty rows", () => {
    const d = parseDelimited("Q,V\nQ1,1\n\n\nQ2,2\n");
    expect(d?.labels).toEqual(["Q1", "Q2"]);
  });

  it("turns an unparseable cell into null instead of dropping the row", () => {
    const d = parseDelimited("Q,V\nQ1,1\nQ2,n/a\nQ3,3");
    expect(d?.labels).toEqual(["Q1", "Q2", "Q3"]);
    expect(d?.series[0].values).toEqual([1, null, 3]);
  });

  /** Ragged rows still have to come out rectangular, as the renderer assumes. */
  it("pads ragged rows to the widest column count", () => {
    const d = parseDelimited("Q1,1,2,3\nQ2,4\nQ3,5,6");
    expect(d?.series).toHaveLength(3);
    for (const s of d!.series) expect(s.values).toHaveLength(3);
    expect(d?.series[2].values).toEqual([3, null, null]);
  });

  it("treats a numeric first row as data, not as a header", () => {
    const d = parseDelimited("1,10\n2,20");
    expect(d?.labels).toEqual(["1", "2"]);
    expect(d?.series[0].name).toBe("Series 1");
  });

  it("produces data that satisfies sanitizeSpec", () => {
    const data = parseDelimited("Quarter,A,B\nQ1,1,2\nQ2,3,4");
    const spec = sanitizeSpec({ type: "bar", data, options: DEFAULT_OPTIONS });
    expect(spec).not.toBeNull();
    expect(spec?.data.series).toHaveLength(2);
  });
});
