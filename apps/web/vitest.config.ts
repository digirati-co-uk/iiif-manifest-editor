import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/components": fileURLToPath(new URL("../../packages/components/src/index.tsx", import.meta.url)),
      "@manifest-editor/shell": fileURLToPath(new URL("../../packages/shell/src/index.ts", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
    include: ["apps/web/test/**/*.test.tsx"],
    environment: "jsdom",
  },
});
