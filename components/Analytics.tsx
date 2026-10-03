"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/**
 * Strips the query string and fragment from a measured URL.
 *
 * `/#c=N4IgLgpgBA...` becomes `/`.
 */
function stripQuery(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

/**
 * Vercel Web Analytics, with the query string and fragment cut off.
 *
 * Vercel's script reports `location.href` in full, fragment included. Here the
 * fragment *is* the chart: `Studio` compresses the whole spec into `#c=...` so
 * a share link needs no server. Opening such a link fires a pageview, and
 * without this guard the visitor's numbers, labels and title would be shipped
 * to a third party — contradicting the privacy page, which promises chart data
 * is "never sent to our servers" and that browsers do not send the fragment.
 *
 * `beforeSend` cuts it before the request leaves the browser: only the page
 * path survives, which is the single thing being measured. The promise rests on
 * the code, not on trust. Do not remove this guard without also revisiting the
 * "Your chart data" and "Analytics" sections of `app/privacy/page.tsx`.
 *
 * This is a client component because `beforeSend` is a function, and functions
 * cannot cross the server/client boundary from `app/layout.tsx`.
 */
export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => ({ ...event, url: stripQuery(event.url) })}
    />
  );
}
