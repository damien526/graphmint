import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same alias as `tsconfig.json`, so a test imports `@/lib/...` exactly the
    // way the application does.
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    // Everything under test here is plain TypeScript: no DOM, no React.
    // The two browser-only paths — `lib/export.ts` (canvas, clipboard) and the
    // share-link round trip in `lib/data.ts` (CompressionStream) — are covered
    // by `scripts/e2e.mjs` against a real build instead.
    environment: "node",
    include: ["lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["**/*.test.ts"],
    },
  },
});
