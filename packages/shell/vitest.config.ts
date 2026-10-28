import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: {
    alias: Object.fromEntries(
      ["components", "creator-api", "editor-api", "client-vault"].map((name) => [
        `@manifest-editor/${name}`,
        fileURLToPath(new URL(`../${name}/src/index.${name === "components" ? "tsx" : "ts"}`, import.meta.url)),
      ])
    ),
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "jsdom",
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
  },
});
