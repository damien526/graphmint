// Ping IndexNow (Bing & friends) with every indexable URL.
// Run manually after a production deploy: npm run indexnow

const KEY = "33e7ae70d2ea7034e4f12afd0a4f361e";
const SITE = "https://chartmint.vercel.app";

const SLUGS = [
  "",
  "bar-graph-maker",
  "horizontal-bar-chart-maker",
  "line-graph-maker",
  "area-chart-maker",
  "pie-chart-maker",
  "donut-chart-maker",
  "scatter-plot-maker",
];

const urlList = SLUGS.map((s) => `${SITE}/${s}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`IndexNow: ${res.status} ${res.statusText}`);
console.log(urlList.join("\n"));
