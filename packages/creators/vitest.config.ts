import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
const source = (name: string) =>
  fileURLToPath(new URL(`../${name}/src/index.${name === "components" ? "tsx" : "ts"}`, import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/editor-api": source("editor-api"),
      "@manifest-editor/components": source("components"),
      "@manifest-editor/shell": source("shell"),
      "@manifest-editor/creator-api": source("creator-api"),
      "@manifest-editor/client-vault": source("client-vault"),
      "@manifest-editor/editors": source("editors"),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["packages/creators/test/**/*.test.tsx", "packages/creators/src/**/*.test.ts"],
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
  },
});
