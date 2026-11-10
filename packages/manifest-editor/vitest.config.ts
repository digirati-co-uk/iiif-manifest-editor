import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/manifest-preset": fileURLToPath(
        new URL("../../presets/manifest-preset/src/index.tsx", import.meta.url)
      ),
      "@manifest-editor/collection-preset": fileURLToPath(
        new URL("../../presets/collection-preset/src/index.tsx", import.meta.url)
      ),
      ...Object.fromEntries(
        ["shell", "components", "creator-api", "editor-api", "client-vault"].map((name) => [
          `@manifest-editor/${name}`,
          fileURLToPath(new URL(`../${name}/src/index.${name === "components" ? "tsx" : "ts"}`, import.meta.url)),
        ])
      ),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "browser/*.test.mjs"],
    environment: "jsdom",
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
  },
});
