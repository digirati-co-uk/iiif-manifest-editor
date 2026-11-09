import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
const pkg = (name: string, ext = "ts") =>
  fileURLToPath(new URL(`../../packages/${name}/src/index.${ext}`, import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/components": pkg("components", "tsx"),
      "@manifest-editor/shell": pkg("shell"),
      "@manifest-editor/editor-api": pkg("editor-api"),
      "@manifest-editor/creator-api": pkg("creator-api"),
      "@manifest-editor/client-vault": pkg("client-vault"),
      "@manifest-editor/editors": pkg("editors"),
      "@manifest-editor/creators": pkg("creators"),
      "@manifest-editor/annotations": fileURLToPath(new URL("../../plugins/annotations/src/index.ts", import.meta.url)),
      "@manifest-editor/canvas-label-generator": fileURLToPath(
        new URL("../../plugins/canvas-label-generator/src/index.ts", import.meta.url)
      ),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["presets/manifest-preset/src/**/*.test.ts", "presets/manifest-preset/test/**/*.test.tsx"],
    server: { deps: { inline: ["iiif-browser", "react-timeago"] } },
  },
});
