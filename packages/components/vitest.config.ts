import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
    include: ["packages/components/test/**/*.test.tsx"],
    environment: "jsdom",
  },
});
