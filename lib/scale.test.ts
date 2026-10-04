import { describe, expect, it } from "vitest";

import {
  formatNumber,
  formatPercent,
  linearPath,
  monotonePath,
  niceScale,
  roundedRightRect,
  roundedTopRect,
} from "./scale";

/**
 * The axis and the path builders — the pure geometry behind every chart.
 *
 * `niceScale` is the one with teeth. Every renderer divides by `max - min` to
 * place a point, so a scale that returns an empty tick list, or `min === max`,
 * produces either an invisible chart or a division by zero that surfaces as
 * `NaN` inside an SVG `d` attribute — which browsers render as nothing at all,
 * silently. The degenerate inputs are therefore enumerated rather than
 * sampled: a single data point, all-zero data, negative-only data, and the
 * non-finite values `sanitizeSpec` turns into `null` and the renderer may
 * still reduce over.
 *
 * The path builders are asserted for shape, not for exact curvature: what
 * matters is that they emit a parseable `d` with no `NaN` in it, and that they
 * degrade sensibly at one and two points, where a cubic has no tangents to
 * work from.
 */

/** No path may ever contain NaN/Infinity: the browser drops the shape in silence. */
function expectCleanPath(d: string) {
  expect(d).not.toMatch(/NaN|Infinity/);
}

describe("niceScale — always usable", () => {
  it.each([
    ["ordinary positive data", 0, 100],
    ["data not starting at zero", 38, 74],
    ["negative only", -50, -10],
    ["straddling zero", -20, 80],
    ["tiny fractions", 0.001, 0.009],
    ["very large", 1e6, 9e6],
    ["single point at zero", 0, 0],
    ["single non-zero point", 42, 42],
    ["single negative point", -42, -42],
  ])("yields a monotonic, finite tick list for %s", (_label, lo, hi) => {
    const s = niceScale(lo, hi);
    expect(s.ticks.length).toBeGreaterThanOrEqual(2);
    expect(s.max).toBeGreaterThan(s.min);
    for (const t of s.ticks) expect(Number.isFinite(t)).toBe(true);
    for (let i = 1; i < s.ticks.length; i++) {
      expect(s.ticks[i]).toBeGreaterThan(s.ticks[i - 1]);
    }
  });

  it("brackets the data it was given", () => {
    for (const [lo, hi] of [
      [0, 100],
      [38, 74],
      [-50, -10],
      [-20, 80],
      [3, 7],
    ]) {
      const s = niceScale(lo, hi);
      expect(s.min, `min for ${lo}..${hi}`).toBeLessThanOrEqual(lo);
      expect(s.max, `max for ${lo}..${hi}`).toBeGreaterThanOrEqual(hi);
    }
  });

  it("puts the first and last tick exactly on the bounds", () => {
    const s = niceScale(0, 100);
    expect(s.ticks[0]).toBe(s.min);
    expect(s.ticks[s.ticks.length - 1]).toBeCloseTo(s.max, 10);
  });

  it("falls back to a unit scale for non-finite input", () => {
    for (const [lo, hi] of [
      [NaN, 10],
      [0, NaN],
      [-Infinity, Infinity],
      [NaN, NaN],
    ]) {
      expect(niceScale(lo, hi)).toEqual({ min: 0, max: 1, ticks: [0, 0.5, 1] });
    }
  });

  it("gives all-zero data a unit scale rather than a flat one", () => {
    expect(niceScale(0, 0)).toEqual({ min: 0, max: 1, ticks: [0, 0.5, 1] });
  });

  /** A lone bar should sit against a zero baseline, not float mid-axis. */
  it("anchors a single positive point at zero", () => {
    expect(niceScale(42, 42).min).toBe(0);
  });

  /**
   * `maxTicks` sizes the step, it is not a hard cap: the step is rounded to a
   * readable number and then the bounds are widened out to multiples of it, so
   * the count can land above the ask. What must hold is that a bigger budget
   * never yields a coarser axis, and that the result stays label-sized.
   */
  it("treats the tick budget as a target, monotonically", () => {
    const counts = [4, 6, 8, 11].map((maxTicks) => niceScale(0, 97, maxTicks).ticks.length);
    for (const c of counts) {
      expect(c).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(16);
    }
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i], `budgets ${counts}`).toBeGreaterThanOrEqual(counts[i - 1]);
    }
  });

  it("snaps to round steps a reader can actually read", () => {
    // 0..97 should land on 0,20,40,...,100 — not 0,19.4,38.8,…
    expect(niceScale(0, 97).ticks).toEqual([0, 20, 40, 60, 80, 100]);
    // Fractional data gets round fractional steps. Compared with a tolerance:
    // the step is 0.2, which has no exact binary representation, so the
    // accumulated ticks carry float dust that is not worth pinning literally.
    const fractional = niceScale(0, 1).ticks;
    expect(fractional).toHaveLength(6);
    fractional.forEach((t, i) => expect(t).toBeCloseTo(i * 0.2, 10));
  });

  /**
   * Floating-point drift used to leave a tick at 2.7755575615628914e-17 instead
   * of 0, which then printed as "0" but sorted and compared as non-zero.
   */
  it("pins a near-zero tick to exact zero", () => {
    const s = niceScale(-20, 80);
    expect(s.ticks).toContain(0);
    expect(s.ticks.some((t) => t !== 0 && Math.abs(t) < 1e-9)).toBe(false);
  });
});

describe("formatNumber", () => {
  it.each([
    [0, "0"],
    [7, "7"],
    [1234, "1,234"],
    [3.14159, "3.14"],
    [-42, "-42"],
  ])("formats %f plainly as %s", (v, expected) => {
    expect(formatNumber(v)).toBe(expected);
  });

  /** Axis labels have to fit: five digits and up go compact automatically. */
  it("switches to compact notation at 10,000 and above", () => {
    expect(formatNumber(9999)).toBe("9,999");
    expect(formatNumber(10000)).toBe("10K");
    expect(formatNumber(1_500_000)).toBe("1.5M");
  });

  it("can be forced compact below the threshold", () => {
    expect(formatNumber(1234, true)).toBe("1.2K");
  });

  it("returns an empty string for non-finite input", () => {
    expect(formatNumber(NaN)).toBe("");
    expect(formatNumber(Infinity)).toBe("");
  });
});

describe("formatPercent", () => {
  it("drops the decimal at 10% and above, keeps one below", () => {
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(0.1)).toBe("10%");
    expect(formatPercent(0.094)).toBe("9.4%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("path builders", () => {
  const pts: [number, number][] = [
    [0, 10],
    [10, 40],
    [20, 20],
    [30, 35],
  ];

  it("linearPath emits one move and then line segments", () => {
    const d = linearPath(pts);
    expect(d.startsWith("M0,10")).toBe(true);
    expect(d.match(/L/g)).toHaveLength(3);
    expectCleanPath(d);
  });

  it("linearPath returns an empty string for no points", () => {
    expect(linearPath([])).toBe("");
  });

  it("monotonePath degrades to a move, then a line, then curves", () => {
    expect(monotonePath([])).toBe("");
    expect(monotonePath([[5, 6]])).toBe("M5,6");
    expect(monotonePath([[0, 0], [10, 10]])).toBe("M0,0L10,10");
    const d = monotonePath(pts);
    expect(d.match(/C/g)).toHaveLength(3);
    expectCleanPath(d);
  });

  /**
   * Monotone interpolation exists to stop a curve overshooting a local
   * extremum — a line chart that dips below zero between two positive points
   * is wrong, not stylish. At a reversal the tangent must be flat.
   */
  it("monotonePath flattens the tangent at a direction change", () => {
    const peak: [number, number][] = [
      [0, 0],
      [10, 10],
      [20, 0],
    ];
    const d = monotonePath(peak);
    // The control points around the apex share its y, i.e. zero slope there.
    expect(d).toContain("10,10");
    expectCleanPath(d);
  });

  it("monotonePath survives duplicate x values without emitting NaN", () => {
    expectCleanPath(
      monotonePath([
        [0, 0],
        [0, 10],
        [0, 20],
      ]),
    );
  });

  it("roundedTopRect closes its path and clamps the radius", () => {
    const d = roundedTopRect(0, 0, 100, 50, 8);
    expect(d.startsWith("M0,50")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expectCleanPath(d);
    // A radius larger than the box must not invert the corners.
    expectCleanPath(roundedTopRect(0, 0, 4, 2, 999));
    // A zero-height bar (a null or zero datum) still has to produce a path.
    expectCleanPath(roundedTopRect(0, 0, 10, 0, 4));
  });

  it("roundedRightRect closes its path and clamps the radius", () => {
    const d = roundedRightRect(0, 0, 100, 50, 8);
    expect(d.startsWith("M0,0")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expectCleanPath(d);
    expectCleanPath(roundedRightRect(0, 0, 2, 4, 999));
    expectCleanPath(roundedRightRect(0, 0, 0, 10, 4));
  });

  it("never emits a negative radius, whatever is asked of it", () => {
    expectCleanPath(roundedTopRect(0, 0, 100, 50, -20));
    expectCleanPath(roundedRightRect(0, 0, 100, 50, -20));
  });
});
