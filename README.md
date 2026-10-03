# Graphmint

**Beautiful charts in seconds.** Free online chart maker: no sign-up, no watermark lock-in, and your data never leaves the browser.

🌐 **[graphmint.app](https://www.graphmint.app)**

## What it does

Seven chart types (bar, horizontal bar, line, area, pie, donut, scatter) rendered by a custom SVG engine with curated palettes and careful typography. Paste data straight from Excel or Google Sheets, style the chart, and export:

- **PNG** at 2× resolution (fonts embedded)
- **SVG**: true vector, opens cleanly in Figma / Illustrator
- **Clipboard**: paste directly into slides or chat
- **Share links**: the whole chart is compressed into the URL (no server, no storage)

Work is autosaved to `localStorage`. Nothing is ever uploaded: rendering, exports and share links are all computed client-side.

## Stack

- [Next.js 15](https://nextjs.org) (App Router, fully static) + React 19
- Tailwind CSS 4
- Custom SVG chart engine, no charting library
- Deployed on Vercel

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run indexnow   # ping IndexNow after a production deploy
```

## Structure

```
app/            pages (home + one landing page per chart type), sitemap, robots, manifest
components/     Studio editor (data grid, style panel, export bar), site chrome
lib/            chart engine (SVG), palettes, scales, CSV/TSV parsing, URL codec, export
public/         fonts (Inter, Space Grotesk), icons, OG images
```
