"use client";

import React from "react";
import type { ChartOptions, ChartType } from "@/lib/types";
import { PALETTES } from "@/lib/palettes";
import { Section, Field, TextInput, Toggle, Segmented } from "./controls";

export function StylePanel({
  type,
  options,
  onChange,
}: {
  type: ChartType;
  options: ChartOptions;
  onChange: (o: Partial<ChartOptions>) => void;
}) {
  const radial = type === "pie" || type === "donut";
  const bars = type === "bar" || type === "bar-horizontal";
  const lineish = type === "line" || type === "area";

  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <Section title="Text">
        <Field label="Title">
          <TextInput
            value={options.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Give your chart a title"
          />
        </Field>
        <Field label="Subtitle">
          <TextInput
            value={options.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Add context, units, or a date range"
          />
        </Field>
        {!radial && (
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="X-axis label">
              <TextInput
                value={options.xLabel}
                onChange={(e) => onChange({ xLabel: e.target.value })}
                placeholder="e.g. Month"
              />
            </Field>
            <Field label="Y-axis label">
              <TextInput
                value={options.yLabel}
                onChange={(e) => onChange({ yLabel: e.target.value })}
                placeholder="e.g. Sales"
              />
            </Field>
          </div>
        )}
      </Section>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-1.5">
          {PALETTES.map((p) => {
            const active = options.palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ palette: p.id })}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-ctrl border px-2.5 py-2 transition ${
                  active
                    ? "border-mint-500 bg-mint-50"
                    : "border-line bg-card hover:border-line-2"
                }`}
              >
                <span className="flex overflow-hidden rounded-[5px]">
                  {p.colors.slice(0, 5).map((c) => (
                    <span key={c} className="h-4 w-3" style={{ background: c }} />
                  ))}
                </span>
                <span className={`text-[12px] font-medium ${active ? "text-mint-700" : "text-ink-2"}`}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
        <Field label="Canvas">
          <Segmented
            ariaLabel="Canvas background"
            value={options.background}
            onChange={(background) => onChange({ background })}
            options={[
              { value: "white", label: "White" },
              { value: "cream", label: "Cream" },
              { value: "dark", label: "Dark" },
              { value: "transparent", label: "None" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Layout">
        <Field label="Format">
          <Segmented
            ariaLabel="Aspect ratio"
            value={options.aspect}
            onChange={(aspect) => onChange({ aspect })}
            options={[
              { value: "wide", label: "16:9" },
              { value: "classic", label: "4:3" },
              { value: "square", label: "1:1" },
            ]}
          />
        </Field>
        <Field label="Legend">
          <Segmented
            ariaLabel="Legend position"
            value={options.legend}
            onChange={(legend) => onChange({ legend })}
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "none", label: "Hidden" },
            ]}
          />
        </Field>
        <Field label="Text size">
          <Segmented
            ariaLabel="Text size"
            value={String(options.fontScale)}
            onChange={(v) => onChange({ fontScale: parseFloat(v) })}
            options={[
              { value: "0.85", label: "S" },
              { value: "1", label: "M" },
              { value: "1.2", label: "L" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Details">
        {!radial && <Toggle label="Grid lines" checked={options.showGrid} onChange={(showGrid) => onChange({ showGrid })} />}
        {!radial && type !== "scatter" && (
          <Toggle label="Value labels" checked={options.showValues} onChange={(showValues) => onChange({ showValues })} />
        )}
        {(bars || type === "area") && (
          <Toggle label="Stacked" checked={options.stacked} onChange={(stacked) => onChange({ stacked })} />
        )}
        {bars && <Toggle label="Rounded bars" checked={options.rounded} onChange={(rounded) => onChange({ rounded })} />}
        {lineish && <Toggle label="Smooth curves" checked={options.smooth} onChange={(smooth) => onChange({ smooth })} />}
        {radial && (
          <>
            <Toggle
              label="Show percentages"
              checked={options.showPercent}
              onChange={(showPercent) => onChange({ showPercent })}
            />
            <Toggle
              label="Sort slices by size"
              checked={options.sortSlices}
              onChange={(sortSlices) => onChange({ sortSlices })}
            />
          </>
        )}
        <Toggle
          label="graphmint.vercel.app caption"
          checked={options.watermark}
          onChange={(watermark) => onChange({ watermark })}
        />
      </Section>
    </div>
  );
}
