import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Graphmint: Free Chart Maker",
    short_name: "Graphmint",
    description:
      "Make beautiful charts online in seconds. Free, no sign-up, PNG & SVG export.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#0fa678",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
