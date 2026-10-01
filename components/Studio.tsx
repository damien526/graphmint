"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ChartSpec, ChartType } from "@/lib/types";
import { Chart } from "@/lib/chart/Chart";
import { sampleSpec, encodeSpec, decodeSpec } from "@/lib/data";
import { downloadPng, downloadSvg, copyPngToClipboard, slugForFilename } from "@/lib/export";
import { DataPanel } from "./DataPanel";
import { StylePanel } from "./StylePanel";
import { TypePicker } from "./TypePicker";

const STORE_PREFIX = "graphmint:v1:";

export function Studio({ initialType }: { initialType: ChartType }) {
  const [spec, setSpec] = useState<ChartSpec>(() => sampleSpec(initialType));
  const [tab, setTab] = useState<"data" | "style">("data");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // Restore: shared link first, then last edit for this chart type
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = window.location.hash.match(/#c=([A-Za-z0-9_-]+)/);
      if (m) {
        const shared = await decodeSpec(m[1]);
        if (shared && !cancelled) {
          setSpec(shared);
          hydrated.current = true;
          return;
        }
      }
      try {
        const raw = localStorage.getItem(STORE_PREFIX + initialType);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as ChartSpec;
          if (saved?.type && saved?.data) setSpec(saved);
        }
      } catch {}
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [initialType]);

  // Autosave (debounced)
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE_PREFIX + spec.type, JSON.stringify(spec));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [spec]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const getSvg = () => frameRef.current?.querySelector("svg") ?? null;

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch {
      showToast("Something went wrong — try again");
    } finally {
      setBusy(null);
    }
  };

  const filename = slugForFilename(spec.options.title, spec.type);

  const onPng = (scale: number) =>
    run("png", async () => {
      const svg = getSvg();
      if (svg) {
        await downloadPng(svg, filename, scale);
        showToast("PNG downloaded");
      }
    });

  const onSvg = () =>
    run("svg", async () => {
      const svg = getSvg();
      if (svg) {
        await downloadSvg(svg, filename);
        showToast("SVG downloaded");
      }
    });

  const onCopy = () =>
    run("copy", async () => {
      const svg = getSvg();
      if (svg) {
        const ok = await copyPngToClipboard(svg);
        showToast(ok ? "Copied to clipboard" : "Copy not supported in this browser");
      }
    });

  const onShare = () =>
    run("share", async () => {
      const hash = await encodeSpec(spec);
      const url = `${window.location.origin}${window.location.pathname}#c=${hash}`;
      history.replaceState(null, "", `#c=${hash}`);
      await navigator.clipboard.writeText(url);
      showToast("Share link copied");
    });

  const setType = (type: ChartType) => setSpec((s) => ({ ...s, type }));

  return (
    <section
      aria-label="Chart editor"
      className="overflow-hidden rounded-card border border-line bg-card shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <TypePicker value={spec.type} onChange={setType} />
        <div className="hidden items-center gap-1.5 text-[12px] font-medium text-ink-3 sm:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint-500" />
          Autosaved in your browser
        </div>
      </div>

      <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* left: data & style */}
        <aside className="order-2 flex min-h-0 flex-col border-t border-line lg:order-1 lg:h-[600px] lg:border-r lg:border-t-0">
          <div className="flex gap-1 border-b border-line px-4 pt-3" role="tablist" aria-label="Editor panels">
            {(["data", "style"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`relative rounded-t-md px-3 pb-2.5 pt-1 text-[13px] font-semibold capitalize transition ${
                  tab === t ? "text-ink" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-mint-600" />
                )}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 max-lg:max-h-[420px] max-lg:overflow-y-auto">
            {tab === "data" ? (
              <DataPanel
                data={spec.data}
                type={spec.type}
                onChange={(data) => setSpec((s) => ({ ...s, data }))}
              />
            ) : (
              <StylePanel
                type={spec.type}
                options={spec.options}
                onChange={(patch) => setSpec((s) => ({ ...s, options: { ...s.options, ...patch } }))}
              />
            )}
          </div>
        </aside>

        {/* right: canvas + export */}
        <div className="order-1 flex min-w-0 flex-col lg:order-2">
          <div className="canvas-dots flex flex-1 items-center justify-center p-4 sm:p-7">
            <div
              ref={frameRef}
              className="w-full max-w-[820px] overflow-hidden rounded-xl shadow-pop ring-1 ring-line"
              style={
                spec.options.background === "transparent"
                  ? {
                      backgroundImage:
                        "repeating-conic-gradient(#f0f2f5 0% 25%, #ffffff 0% 50%)",
                      backgroundSize: "16px 16px",
                    }
                  : undefined
              }
            >
              <Chart spec={spec} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
            <button
              type="button"
              onClick={() => onPng(2)}
              disabled={busy !== null}
              className="inline-flex h-9 items-center gap-2 rounded-ctrl bg-mint-600 px-4 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-mint-700 disabled:opacity-60"
            >
              <DownloadIcon />
              {busy === "png" ? "Exporting…" : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={onSvg}
              disabled={busy !== null}
              className="h-9 rounded-ctrl border border-line-2 bg-card px-3.5 text-[13px] font-semibold text-ink-2 transition hover:border-mint-500 hover:text-mint-700 disabled:opacity-60"
            >
              SVG
            </button>
            <button
              type="button"
              onClick={onCopy}
              disabled={busy !== null}
              className="h-9 rounded-ctrl border border-line-2 bg-card px-3.5 text-[13px] font-semibold text-ink-2 transition hover:border-mint-500 hover:text-mint-700 disabled:opacity-60"
            >
              Copy image
            </button>
            <button
              type="button"
              onClick={onShare}
              disabled={busy !== null}
              className="h-9 rounded-ctrl border border-line-2 bg-card px-3.5 text-[13px] font-semibold text-ink-2 transition hover:border-mint-500 hover:text-mint-700 disabled:opacity-60"
            >
              Share link
            </button>
            <span className="ml-auto hidden text-[12px] text-ink-3 sm:inline">
              Free · no sign-up · your data never leaves this page
            </span>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-pop"
        >
          {toast}
        </div>
      )}
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0L5 7m3 3l3-3M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}
