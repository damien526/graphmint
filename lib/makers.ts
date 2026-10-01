import type { ChartType } from "./types";

export interface MakerPage {
  slug: string;
  type: ChartType;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string[];
  steps: { name: string; text: string }[];
  whenTitle: string;
  when: string[];
  tips: string[];
  faq: { q: string; a: string }[];
  related: { slug: string; label: string }[];
}

export const MAKERS: MakerPage[] = [
  {
    slug: "bar-graph-maker",
    type: "bar",
    h1: "Bar Graph Maker",
    metaTitle: "Free Bar Graph Maker — No Sign-Up, Download PNG & SVG",
    metaDescription:
      "Make a beautiful bar graph online in seconds. Free bar chart maker with no sign-up: paste data from Excel, customize colors, download as PNG or SVG.",
    tagline:
      "Type your numbers or paste them from a spreadsheet — your bar graph updates live. Download it as a crisp PNG or SVG, free and without an account.",
    intro: [
      "A bar graph is the fastest way to compare quantities across categories: sales by quarter, votes by candidate, hours by project. This bar graph maker gives you a clean, presentation-ready chart without installing software, creating an account, or fighting with spreadsheet styling.",
      "Everything happens in your browser. Your data is never uploaded to a server, which makes this tool safe to use even for confidential numbers from work or school.",
    ],
    steps: [
      {
        name: "Add your data",
        text: "Type category names and values into the table, or copy cells in Excel or Google Sheets and paste them directly into the editor — headers are detected automatically.",
      },
      {
        name: "Shape the graph",
        text: "Add more series with “+ Series” for grouped bars, or flip on “Stacked” to pile series on top of each other. Switch to horizontal bars anytime with one click.",
      },
      {
        name: "Make it yours",
        text: "Pick one of eight color palettes, choose a light, cream, or dark canvas, add a title and axis labels, and toggle value labels if you want exact numbers on the chart.",
      },
      {
        name: "Download or share",
        text: "Export your bar graph as a PNG for slides and documents, as an SVG for perfect scaling, copy it straight to your clipboard, or copy a share link that contains the whole chart.",
      },
    ],
    whenTitle: "When should you use a bar graph?",
    when: [
      "Bar graphs shine when you compare discrete categories: products, teams, countries, months treated as separate buckets. The length of each bar maps directly to its value, which is the single easiest visual comparison for the human eye.",
      "Use grouped bars when you compare two or three series side by side (this year vs last year), and stacked bars when the total matters as much as its parts (total revenue split by product line). If your categories have long names — survey answers, country names — switch to a horizontal bar chart so the labels stay readable.",
      "If you are tracking a continuous trend over many time points, a line graph usually tells that story better than a forest of bars.",
    ],
    tips: [
      "Start your value axis at zero — bar lengths are the message, and a truncated axis distorts them.",
      "Sort categories by value when the order isn’t meaningful (alphabetical order rarely is).",
      "Keep it to five series or fewer; beyond that, grouped bars become hard to read.",
      "Use one strong color for a single series instead of rainbow bars — color should mean something.",
    ],
    faq: [
      {
        q: "Is this bar graph maker really free?",
        a: "Yes. Every feature on this page — unlimited charts, every palette, PNG, SVG and clipboard export — is free and requires no account. There is no watermark you can’t remove: the small chartmint.app caption can be switched off in the Details panel.",
      },
      {
        q: "Can I paste data from Excel or Google Sheets?",
        a: "Yes. Select your cells in Excel, Google Sheets or Numbers, copy them, click anywhere in the data table and paste. Column headers become series names and the first column becomes your category labels automatically.",
      },
      {
        q: "How do I make a grouped or stacked bar chart?",
        a: "Add a second column with the “+ Series” button to get grouped bars automatically. To stack them instead, open the Style tab and turn on the “Stacked” toggle. Value labels then show the total of each stack.",
      },
      {
        q: "What file formats can I download?",
        a: "PNG at 2× resolution for crisp slides and documents, and SVG for a vector file you can scale to any size or edit in Figma, Illustrator or Inkscape. You can also copy the chart to your clipboard and paste it straight into PowerPoint, Word or Slack.",
      },
      {
        q: "Is my data uploaded anywhere?",
        a: "No. The chart is rendered entirely in your browser and your numbers never leave your device. A share link encodes the chart data inside the link itself, so nothing is stored on a server either.",
      },
    ],
    related: [
      { slug: "horizontal-bar-chart-maker", label: "Horizontal bar chart maker" },
      { slug: "line-graph-maker", label: "Line graph maker" },
      { slug: "pie-chart-maker", label: "Pie chart maker" },
    ],
  },
  {
    slug: "horizontal-bar-chart-maker",
    type: "bar-horizontal",
    h1: "Horizontal Bar Chart Maker",
    metaTitle: "Horizontal Bar Chart Maker — Free, No Sign-Up",
    metaDescription:
      "Create a horizontal bar chart online for free. Perfect for rankings and long labels. Paste your data, style it, and download as PNG or SVG — no account needed.",
    tagline:
      "The right chart for rankings and long category names. Paste your data, pick a palette, and export a clean horizontal bar chart in seconds.",
    intro: [
      "Horizontal bar charts are the undisputed champion for rankings and survey results: “most used programming languages”, “top ten countries by population”, “which feature do customers want next”. Labels sit comfortably on the left where there is room to breathe, and the longest bar instantly declares the winner.",
      "This maker runs entirely in your browser — no upload, no account, no watermark lock-in. Build the chart, download it, done.",
    ],
    steps: [
      {
        name: "Enter categories and values",
        text: "Each row is one bar. Type the label and its value, or paste a two-column range straight from your spreadsheet.",
      },
      {
        name: "Order the bars",
        text: "For rankings, enter rows from largest to smallest (or smallest to largest for a “bottom 10”). The chart follows your row order exactly, so you stay in control.",
      },
      {
        name: "Style it",
        text: "Choose a palette and canvas, add a clear title, and switch on value labels so readers get the exact number at the end of each bar.",
      },
      {
        name: "Export",
        text: "Download a high-resolution PNG or an infinitely scalable SVG, or copy the chart image directly to your clipboard for slides and chat.",
      },
    ],
    whenTitle: "When is horizontal better than vertical?",
    when: [
      "Flip your bars horizontal whenever labels are longer than a word or two. Vertical bar charts force long labels to rotate diagonally or truncate; horizontal bars give every label a full line of comfortable, readable text.",
      "Horizontal bars also handle many categories gracefully. Fifteen vertical bars feel cramped on a slide, but fifteen horizontal bars just make the chart taller — scrolling down a ranked list is a natural reading motion.",
      "For time series — months, years, quarters in sequence — keep bars vertical or use a line graph, because western readers expect time to flow left to right.",
    ],
    tips: [
      "Sort by value unless the category order carries meaning — a ranked list is the whole point of this layout.",
      "Switch value labels on: rankings are usually quoted (“Python at 51%”), so put the numbers on the chart.",
      "Use the 4:3 or square format when you have many rows, so bars keep a comfortable thickness.",
      "A single color is usually right; save multi-color palettes for charts with several series.",
    ],
    faq: [
      {
        q: "What’s the difference between a bar chart and a column chart?",
        a: "Strictly speaking, a “column chart” has vertical bars and a “bar chart” has horizontal ones — though in everyday use, “bar chart” covers both. This page makes horizontal bars; our bar graph maker makes the vertical kind. Both share the same editor, so you can flip between them with one click.",
      },
      {
        q: "How many bars can I add?",
        a: "Up to 200 rows, far more than any readable chart needs. For a clean export with many bars, choose the 4:3 or 1:1 format so each bar keeps enough height, and consider splitting anything beyond 20 bars into a “top 20”.",
      },
      {
        q: "Can I show the exact value on each bar?",
        a: "Yes — open the Style tab and enable “Value labels”. Each value is printed at the end of its bar, formatted compactly (12.5k instead of 12,500) so labels never overwhelm the chart.",
      },
      {
        q: "Can I use this for survey results?",
        a: "It’s ideal for them. Paste the answer options and their percentages, sort rows from most to least chosen, and switch on value labels. The percent signs can stay in your data — the parser reads “42%” as 42.",
      },
    ],
    related: [
      { slug: "bar-graph-maker", label: "Bar graph maker" },
      { slug: "pie-chart-maker", label: "Pie chart maker" },
      { slug: "donut-chart-maker", label: "Donut chart maker" },
    ],
  },
  {
    slug: "line-graph-maker",
    type: "line",
    h1: "Line Graph Maker",
    metaTitle: "Free Line Graph Maker — Create Line Charts Online",
    metaDescription:
      "Make a clean line graph online, free and without an account. Paste data from a spreadsheet, compare several series, and export your line chart as PNG or SVG.",
    tagline:
      "Perfect for trends over time. Paste your data, compare multiple lines, and export a presentation-ready line graph — free, no account.",
    intro: [
      "Line graphs turn a column of numbers into a story: growth, decline, seasonality, the moment everything changed. This line graph maker builds that story in your browser with smooth or straight lines, multiple series, and typography that looks deliberate rather than default.",
      "Nothing is uploaded, nothing requires a login, and the result exports as a sharp PNG or a vector SVG that scales to any size.",
    ],
    steps: [
      {
        name: "Add your time points",
        text: "Each row is one point on the x-axis: months, years, weeks, dates. Type them in order, or paste the whole range from Excel or Google Sheets.",
      },
      {
        name: "Add one line per series",
        text: "Each column after the first becomes its own line — add “2025” and “2024” columns to compare years, or one column per product, team, or country.",
      },
      {
        name: "Tune the look",
        text: "Choose smooth curves or straight segments, pick a palette, add axis labels and a subtitle with your units, and decide whether readers need value labels or just the shape.",
      },
      {
        name: "Export and share",
        text: "Download as PNG or SVG, copy the image to your clipboard, or copy a share link — the entire chart travels inside the URL, no server involved.",
      },
    ],
    whenTitle: "When should you use a line graph?",
    when: [
      "Reach for a line graph whenever your x-axis is ordered and continuous — time, temperature, dosage, distance. The connected line tells readers the values belong to one evolving thing, which is exactly what bars can’t say.",
      "Multiple lines excel at comparing trajectories: this year against last year, product A against product B. Two or three lines are instantly readable; five is a practical maximum before the chart becomes spaghetti.",
      "If the area under the curve carries meaning — cumulative revenue, total users — consider an area chart instead. If your categories are unordered (countries, flavors, teams), a bar chart is the honest choice.",
    ],
    tips: [
      "Keep time flowing left to right and at even intervals; skipping years distorts the slope.",
      "Smooth curves look great for organic trends, but switch to straight lines for precise measurements.",
      "Label your units in the subtitle (“in thousands of sessions”) so the y-axis can stay clean.",
      "Unlike bar charts, a line graph’s axis doesn’t have to start at zero — zoom to the range where the action is, and say so.",
    ],
    faq: [
      {
        q: "How many lines can one graph have?",
        a: "The editor supports up to eight series, each with its own color from the palette. For readability, three to five lines is the sweet spot — beyond that, consider splitting into small multiples or highlighting one line against gray context lines.",
      },
      {
        q: "Can I make the lines smooth?",
        a: "Yes. “Smooth curves” is on by default and uses monotone interpolation — curves bend gently but never overshoot your actual data points, so the chart stays truthful. Toggle it off for straight segments.",
      },
      {
        q: "Can I use dates on the x-axis?",
        a: "Yes — your labels are free text, so “Jan 2025”, “2025-01”, “Week 3” all work. Points are spaced evenly in label order; when labels get crowded, the chart automatically shows every second or third one.",
      },
      {
        q: "What if I have missing data points?",
        a: "Leave the cell empty. Missing values are treated as gaps in your data rather than zeros, so a blank month won’t drag your line down to the floor and ruin the trend.",
      },
      {
        q: "Can I download the graph for PowerPoint?",
        a: "Yes — “Download PNG” exports at double resolution, which stays sharp on projectors and retina screens. Or click “Copy image” and paste directly into your deck without touching a file.",
      },
    ],
    related: [
      { slug: "area-chart-maker", label: "Area chart maker" },
      { slug: "bar-graph-maker", label: "Bar graph maker" },
      { slug: "scatter-plot-maker", label: "Scatter plot maker" },
    ],
  },
  {
    slug: "area-chart-maker",
    type: "area",
    h1: "Area Chart Maker",
    metaTitle: "Area Chart Maker — Free Online, PNG & SVG Export",
    metaDescription:
      "Build a stacked or simple area chart online for free. No sign-up: paste your data, choose colors, and download a beautiful area chart as PNG or SVG.",
    tagline:
      "Show how totals grow and how their parts contribute. Build a stacked or simple area chart and export it in seconds — free, no account.",
    intro: [
      "An area chart is a line graph with weight: the filled surface emphasizes volume, not just direction. Stack several series and you get one of the most informative charts in business — total growth and its composition in a single picture.",
      "This area chart maker renders everything client-side with soft gradient fills and clean typography, then exports to PNG or SVG without an account or a watermark you can’t turn off.",
    ],
    steps: [
      {
        name: "Lay out your periods",
        text: "Rows are your x-axis: years, quarters, months. Paste them from a spreadsheet together with one column per segment you want to track.",
      },
      {
        name: "Decide: stacked or overlapping",
        text: "“Stacked” (on by default) piles segments so the top edge is your total. Toggle it off for translucent overlapping areas when you compare independent series.",
      },
      {
        name: "Style the surfaces",
        text: "Pick a palette and canvas, keep smooth curves or switch to straight edges, and add a subtitle that names your units.",
      },
      {
        name: "Export",
        text: "Download as PNG for documents and slides or SVG for design tools, or share the whole chart as a link.",
      },
    ],
    whenTitle: "When should you use an area chart?",
    when: [
      "Use a stacked area chart when the total matters and you want to show what it’s made of: revenue by product line, traffic by channel, energy by source. The outline tells the growth story; the bands tell the composition story.",
      "A simple (unstacked) area chart is a line graph that wants presence — one or two series where the magnitude itself is the message, like cumulative users or cash balance.",
      "Avoid stacking more than five or six segments: the middle bands become hard to read because they don’t share a baseline. And never stack percentages that don’t sum to a meaningful total.",
    ],
    tips: [
      "Order stacked segments with the largest or most stable band at the bottom — it gives the chart a calm foundation.",
      "Area charts should start the y-axis at zero; the filled surface implies quantity from the baseline up.",
      "Prefer the stacked view for composition and the line graph for precise comparison — bands in the middle of a stack are hard to measure by eye.",
      "Use related colors (one palette family) for segments of one whole, rather than clashing hues.",
    ],
    faq: [
      {
        q: "What’s the difference between an area chart and a line graph?",
        a: "They share a skeleton, but the fill changes the message. A line graph emphasizes the trajectory of each series independently; an area chart emphasizes volume, and a stacked area chart adds the parts together so the top edge traces the total. If readers should compare exact values between series, lines are easier; if they should grasp scale and composition, areas win.",
      },
      {
        q: "How do stacked area charts work here?",
        a: "Each column of your table is a band. Values at each x-position are added bottom-to-top in column order, so the upper edge of the top band is the sum. Toggle “Stacked” off and each series is drawn from zero with translucent fill instead.",
      },
      {
        q: "Can bands overlap without stacking?",
        a: "Yes — turn “Stacked” off. Fills become translucent gradients so overlapping regions stay readable, which suits comparing two independent magnitudes like revenue vs costs.",
      },
      {
        q: "Does the export keep the gradients?",
        a: "Yes. Gradients, fonts and exact colors are embedded in both PNG and SVG exports. The SVG opens cleanly in Figma, Illustrator and Inkscape with editable vector shapes.",
      },
    ],
    related: [
      { slug: "line-graph-maker", label: "Line graph maker" },
      { slug: "bar-graph-maker", label: "Bar graph maker" },
      { slug: "donut-chart-maker", label: "Donut chart maker" },
    ],
  },
  {
    slug: "pie-chart-maker",
    type: "pie",
    h1: "Pie Chart Maker",
    metaTitle: "Free Pie Chart Maker — No Sign-Up, Download PNG & SVG",
    metaDescription:
      "Make a pie chart online in seconds, free and without an account. Enter your values, pick beautiful colors, and download your pie chart as PNG or SVG.",
    tagline:
      "Enter your categories, get a clean pie chart with percentages calculated for you. Free, no account, exports to PNG and SVG.",
    intro: [
      "A good pie chart answers one question at a glance: how does the whole divide up? Market share, budget split, survey answers, time allocation. This pie chart maker computes the percentages for you, places readable labels, and keeps slices separated with crisp hairlines so even similar colors stay distinct.",
      "No sign-up, no upload, no locked features: edit your data, pick a palette, download the result.",
    ],
    steps: [
      {
        name: "List your slices",
        text: "One row per slice: a label and a value. Raw numbers are fine — percentages are calculated automatically, so 46 + 24 + 14 doesn’t need to add up to 100.",
      },
      {
        name: "Order or sort",
        text: "Slices start at 12 o’clock and run clockwise in row order. Flip on “Sort slices by size” to arrange them largest-first, the convention most readers expect.",
      },
      {
        name: "Choose the look",
        text: "Pick one of eight palettes, decide whether slices show percentages or raw values, and position the legend where it reads best.",
      },
      {
        name: "Download",
        text: "Export as PNG or SVG, copy the image to the clipboard, or share the chart as a self-contained link.",
      },
    ],
    whenTitle: "When should you use a pie chart?",
    when: [
      "Pie charts are at their best with a handful of slices that genuinely form a whole — one budget, one market, one hundred percent of respondents. Readers judge each slice against the full circle, which works beautifully when one or two slices dominate.",
      "The classic failure mode is too many slices: beyond five or six, the small ones become indistinguishable slivers. Group minor categories into an “Other” slice, or switch to a horizontal bar chart, which compares many categories far more precisely.",
      "If you want the clean look of a pie with a modern feel and space for a total in the middle, try the donut chart — same data, same editor, one click away.",
    ],
    tips: [
      "Five slices or fewer is the sweet spot; merge the long tail into “Other”.",
      "Sort slices largest-first unless the categories have a natural order.",
      "Show percentages on slices and keep exact values for the subtitle or a table.",
      "Make sure your slices are parts of one whole — a pie of unrelated metrics misleads.",
    ],
    faq: [
      {
        q: "Does the pie chart calculate percentages automatically?",
        a: "Yes. Enter raw values — sales, votes, hours — and each slice’s share of the total is computed and displayed automatically. You can switch labels between percentages and raw values in the Style tab.",
      },
      {
        q: "How many slices should a pie chart have?",
        a: "The chart supports many, but readability research and common sense agree on five or fewer. Small slices get labels only when they’re wide enough to fit one; merging small categories into “Other” keeps the story crisp.",
      },
      {
        q: "Can I make a 3D pie chart?",
        a: "No, and that’s deliberate. 3D perspective distorts slice areas — the slice closest to the viewer looks bigger than it is — which misleads readers. A flat pie with clean colors communicates honestly and looks more professional in 2026 than a tilted 3D disc.",
      },
      {
        q: "Pie chart or bar chart — which should I pick?",
        a: "Pie when the message is “parts of a whole” and there are few parts; bars when readers need to compare categories precisely or there are many of them. Human eyes judge lengths better than angles, so when in doubt, bars are the safer choice.",
      },
      {
        q: "Is the download really free, without a watermark?",
        a: "Yes. PNG, SVG and clipboard export are all free with no account. A small chartmint.app caption appears by default and can be turned off with one toggle before you export.",
      },
    ],
    related: [
      { slug: "donut-chart-maker", label: "Donut chart maker" },
      { slug: "bar-graph-maker", label: "Bar graph maker" },
      { slug: "horizontal-bar-chart-maker", label: "Horizontal bar chart maker" },
    ],
  },
  {
    slug: "donut-chart-maker",
    type: "donut",
    h1: "Donut Chart Maker",
    metaTitle: "Donut Chart Maker — Free Online, No Sign-Up",
    metaDescription:
      "Create a modern donut chart online for free. The total sits in the middle, percentages are automatic, and your chart downloads as PNG or SVG — no account.",
    tagline:
      "A pie chart with better typography: the hole in the middle shows your total. Free, no sign-up, PNG and SVG export.",
    intro: [
      "The donut chart is the pie’s modern sibling: same parts-of-a-whole story, but the open center gives the design room to breathe — and a natural home for the headline number. This maker puts your total there automatically, calculates every percentage, and keeps slices crisp with clean separators.",
      "Like every Chartmint tool, it runs fully in your browser: no account, no upload, no watermark you can’t remove.",
    ],
    steps: [
      {
        name: "Enter segments",
        text: "One row per segment with a label and a value. The total in the donut’s center and each percentage update as you type.",
      },
      {
        name: "Arrange",
        text: "Keep your row order or enable “Sort slices by size”. Segments start at the top and run clockwise.",
      },
      {
        name: "Style",
        text: "Choose a palette and canvas — the donut looks especially sharp on the dark canvas — and pick percentage or value labels.",
      },
      {
        name: "Export",
        text: "Download PNG or SVG, copy the image, or share a link that carries the whole chart in the URL.",
      },
    ],
    whenTitle: "Donut or pie — when to choose which?",
    when: [
      "Functionally, donuts and pies encode data the same way: slice angle equals share. Choose the donut when the total deserves to be seen — the center displays it prominently, turning the chart into both a breakdown and a headline metric.",
      "Donuts also read slightly better with similar-sized segments, because readers compare arc lengths along the ring rather than angles at the center.",
      "The same caution applies as with pies: keep segments few, group the tail into “Other”, and if precise comparison across many categories is the goal, a horizontal bar chart will serve readers better.",
    ],
    tips: [
      "Lead with your biggest segment at 12 o’clock — enable sorting or order rows yourself.",
      "The center total is your headline: make sure your values use one consistent unit.",
      "On dashboards, a donut per metric beats one donut with ten segments.",
      "Dark canvas + the Neon palette makes a striking donut for social posts and slides.",
    ],
    faq: [
      {
        q: "What does the number in the middle mean?",
        a: "It’s the sum of all your segment values, formatted compactly (2.5k, 1.2M). Enter a budget of 1150 + 420 + 180 and the center reads the exact total — a built-in headline for your chart.",
      },
      {
        q: "Is a donut chart better than a pie chart?",
        a: "Neither is universally better. Donuts offer a focal point for the total and a more contemporary look; pies make small slices slightly easier to judge because the angle meets at the center. Both are one click apart in this editor, so try each with your data.",
      },
      {
        q: "Can I show values instead of percentages?",
        a: "Yes — in the Style tab, switch “Show percentages” off and slices display their raw values in compact form instead.",
      },
      {
        q: "Can I use the chart commercially?",
        a: "Yes. Charts you create are yours, for any use — reports, articles, client decks, products. No attribution required; the optional chartmint.app caption is just a toggle.",
      },
    ],
    related: [
      { slug: "pie-chart-maker", label: "Pie chart maker" },
      { slug: "area-chart-maker", label: "Area chart maker" },
      { slug: "bar-graph-maker", label: "Bar graph maker" },
    ],
  },
  {
    slug: "scatter-plot-maker",
    type: "scatter",
    h1: "Scatter Plot Maker",
    metaTitle: "Scatter Plot Maker — Free Online, No Sign-Up",
    metaDescription:
      "Make a scatter plot online for free: paste X-Y data, spot correlations, and download your scatter chart as PNG or SVG. No account required.",
    tagline:
      "See the relationship between two variables. Paste X-Y pairs, read the pattern, export the plot — free and without an account.",
    intro: [
      "A scatter plot is the honest workhorse of data analysis: every observation is one dot, and the cloud they form reveals the relationship — rising together, falling apart, or no pattern at all. Study hours against exam scores, price against sales, temperature against energy use.",
      "This scatter plot maker is built for speed: paste two columns, label your axes, and export a clean plot for your report or lab write-up. Your data stays in the browser.",
    ],
    steps: [
      {
        name: "Paste X-Y pairs",
        text: "The first column is X, the second is Y — one row per observation. Paste both columns at once from Excel, Sheets, or any CSV.",
      },
      {
        name: "Name the axes",
        text: "A scatter plot without axis labels is a riddle. Add X and Y labels with units in the Style tab — future readers (and graders) will thank you.",
      },
      {
        name: "Add groups if needed",
        text: "Extra columns become additional point series in their own colors — perfect for comparing two cohorts or conditions on the same axes.",
      },
      {
        name: "Export",
        text: "Download PNG for documents, SVG for publications that need vector graphics, or copy the plot to your clipboard.",
      },
    ],
    whenTitle: "How to read (and present) a scatter plot",
    when: [
      "Look for the shape of the cloud. Dots climbing from bottom-left to top-right suggest a positive relationship; descending dots a negative one; a shapeless cloud, no linear relationship. Tight clouds mean strong association, loose clouds weak.",
      "Watch for outliers — single dots far from the pack. Sometimes they’re data errors; sometimes they’re the most interesting observation in the dataset. Either way, address them rather than hoping readers won’t notice.",
      "Remember the oldest caveat in statistics: correlation is not causation. A beautiful upward cloud says the variables move together, not that one drives the other.",
    ],
    tips: [
      "Always label both axes with units — it’s the difference between a chart and a decoration.",
      "If many dots overlap, the built-in transparency keeps dense regions readable.",
      "Scale axes to your data’s range; scatter plots don’t need to start at zero.",
      "Use two point colors (two series) to compare groups instead of making two separate plots.",
    ],
    faq: [
      {
        q: "What data format does the scatter plot need?",
        a: "Two numeric columns: X values first, Y values second. Each row is one point. Additional numeric columns become extra series, drawn in their own colors on the same axes.",
      },
      {
        q: "Can it draw a trend line?",
        a: "Not yet — the current version focuses on clean, honest point clouds. If you need a fitted line for a publication, export the SVG and add it in your graphics tool, or compute the regression in your spreadsheet and paste the fitted values as a second series.",
      },
      {
        q: "What’s the difference between a scatter plot and a line graph?",
        a: "A line graph connects points in order because X is sequential (usually time) and there’s one Y per X. A scatter plot leaves points unconnected because each is an independent observation, often with repeated or unordered X values. If connecting your dots would create a tangle, you want a scatter plot.",
      },
      {
        q: "How many points can I plot?",
        a: "Up to 200 rows per series in the editor — plenty for coursework, surveys and business analyses. Point transparency keeps overlapping regions legible even at the upper end.",
      },
    ],
    related: [
      { slug: "line-graph-maker", label: "Line graph maker" },
      { slug: "bar-graph-maker", label: "Bar graph maker" },
      { slug: "area-chart-maker", label: "Area chart maker" },
    ],
  },
];

export function getMaker(slug: string): MakerPage | undefined {
  return MAKERS.find((m) => m.slug === slug);
}
