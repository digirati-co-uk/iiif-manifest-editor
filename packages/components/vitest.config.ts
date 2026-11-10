import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias:
      process.env.COMPONENT_MEDIA_DISTRIBUTION === "prod"
        ? [{ find: /^@vidstack\/react$/, replacement: createRequire(import.meta.url).resolve("@vidstack/react") }]
        : [],
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
    include: ["packages/components/test/**/*.test.tsx"],
    environment: "jsdom",
  },
});
