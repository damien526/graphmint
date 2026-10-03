import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Answer engines and their training crawlers, named one by one.
 *
 * This changes nothing about what they are allowed to do — the wildcard
 * already permitted it. Writing them out makes the decision legible: a free
 * tool that wants to be cited correctly by an assistant has every interest in
 * being read by one, and silence reads as oversight rather than as a choice.
 *
 * Unlike the static-export projects in this folder, Graphmint is
 * server-rendered: there are no `index.txt` RSC payloads sitting next to the
 * HTML, so there is nothing of that kind to close here.
 */
const ANSWER_ENGINES = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...ANSWER_ENGINES.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
