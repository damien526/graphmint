/** Client-side chart export: SVG, PNG (1–3x), clipboard. */

let fontCssPromise: Promise<string> | null = null;

/** @font-face CSS with the Inter woff2 inlined, so rasterized SVGs keep their typography. */
function getFontCss(): Promise<string> {
  if (!fontCssPromise) {
    fontCssPromise = (async () => {
      try {
        const res = await fetch("/fonts/inter-var.woff2");
        if (!res.ok) return "";
        const buf = await res.arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        const b64 = btoa(bin);
        return `@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
      } catch {
        return "";
      }
    })();
  }
  return fontCssPromise;
}

async function serializeSvg(svgEl: SVGSVGElement, embedFont: boolean): Promise<string> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("style");
  if (embedFont) {
    const css = await getFontCss();
    if (css) {
      const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
      style.textContent = css;
      clone.insertBefore(style, clone.firstChild);
    }
  }
  return new XMLSerializer().serializeToString(clone);
}

export async function downloadSvg(svgEl: SVGSVGElement, filename: string) {
  const xml = await serializeSvg(svgEl, false);
  triggerDownload(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
}

export async function svgToPngBlob(svgEl: SVGSVGElement, scale: number): Promise<Blob> {
  const xml = await serializeSvg(svgEl, true);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not rasterize chart"));
      img.src = url;
    });
    const w = svgEl.viewBox.baseVal.width || svgEl.width.baseVal.value;
    const h = svgEl.viewBox.baseVal.height || svgEl.height.baseVal.value;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadPng(svgEl: SVGSVGElement, filename: string, scale: number) {
  const blob = await svgToPngBlob(svgEl, scale);
  triggerDownload(blob, `${filename}.png`);
}

export async function copyPngToClipboard(svgEl: SVGSVGElement): Promise<boolean> {
  try {
    if (typeof ClipboardItem === "undefined") return false;
    // Safari requires the promise form inside ClipboardItem
    const item = new ClipboardItem({ "image/png": svgToPngBlob(svgEl, 2) });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function slugForFilename(title: string, type: string): string {
  const base = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || `${type}-chart`;
}
