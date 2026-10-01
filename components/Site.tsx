import Link from "next/link";

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#0fa678" />
        <rect x="7" y="16" width="4.5" height="9" rx="1.5" fill="#fff" opacity="0.75" />
        <rect x="13.75" y="10" width="4.5" height="15" rx="1.5" fill="#fff" />
        <rect x="20.5" y="13" width="4.5" height="12" rx="1.5" fill="#fff" opacity="0.9" />
      </svg>
      <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
        graphmint
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Graphmint home">
          <Logo />
        </Link>
        <nav aria-label="Popular chart makers" className="flex items-center gap-1">
          <HeaderLink href="/bar-graph-maker">Bar</HeaderLink>
          <HeaderLink href="/pie-chart-maker">Pie</HeaderLink>
          <HeaderLink href="/line-graph-maker">Line</HeaderLink>
          <span className="ml-2 hidden rounded-full bg-mint-100 px-2.5 py-1 text-[11.5px] font-semibold text-mint-900 sm:inline">
            Free · No sign-up
          </span>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-ctrl px-2.5 py-1.5 text-[13px] font-medium text-ink-2 transition hover:bg-card hover:text-ink"
    >
      {children}
    </Link>
  );
}

const FOOTER_LINKS = [
  { href: "/", label: "Chart maker" },
  { href: "/bar-graph-maker", label: "Bar graph maker" },
  { href: "/horizontal-bar-chart-maker", label: "Horizontal bar chart maker" },
  { href: "/line-graph-maker", label: "Line graph maker" },
  { href: "/area-chart-maker", label: "Area chart maker" },
  { href: "/pie-chart-maker", label: "Pie chart maker" },
  { href: "/donut-chart-maker", label: "Donut chart maker" },
  { href: "/scatter-plot-maker", label: "Scatter plot maker" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-3">
              Beautiful charts in seconds. Free, no account, and your data never
              leaves your browser.
            </p>
          </div>
          <nav aria-label="All chart makers">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Chart makers
            </p>
            <ul className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] text-ink-2 transition hover:text-mint-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-[12.5px] text-ink-3">
          © {new Date().getFullYear()} Graphmint. Made for everyone who needs a
          clean chart, fast.
        </p>
      </div>
    </footer>
  );
}
