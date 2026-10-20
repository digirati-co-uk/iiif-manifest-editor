import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const sources = {
  "@manifest-editor/components": "packages/components/src/index.tsx",
  "@manifest-editor/shell": "packages/shell/src/index.ts",
  "@manifest-editor/creator-api": "packages/creator-api/src/index.ts",
  "@manifest-editor/editor-api": "packages/editor-api/src/index.ts",
  "@manifest-editor/creators": "packages/creators/src/index.ts",
  "@manifest-editor/editors": "packages/editors/src/index.ts",
  "@manifest-editor/manifest-preset": "presets/manifest-preset/src/index.tsx",
  "@manifest-editor/manifest-preset/components": "presets/manifest-preset/src/components.tsx",
  "@manifest-editor/collection-preset": "presets/collection-preset/src/index.tsx",
  "@manifest-editor/exhibition-preset": "presets/exhibition-preset/src/index.tsx",
  "manifest-editor": "packages/manifest-editor/src/index.ts",
  "manifest-editor/index.css": "packages/manifest-editor/src/index.css",
  "@manifest-editor/client-vault": "packages/client-vault/src/index.ts",
  "@manifest-editor/annotations": "plugins/annotations/src/index.ts",
  "@manifest-editor/canvas-label-generator": "plugins/canvas-label-generator/src/index.ts",
  "@manifest-editor/ocr-classification": "plugins/ocr-classification/src/index.ts",
  "@manifest-editor/ocr-docling": "plugins/ocr-docling/src/index.ts",
  "@manifest-editor/translation": "plugins/translation/src/index.ts",
  "@manifest-editor/specifications": "plugins/specifications/src/index.tsx",
};

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  async viteFinal(config) {
    return mergeConfig(config, {
      define: { "global.setImmediate": "window.setImmediate" },
      resolve: {
        alias: Object.entries(sources).map(([name, source]) => ({
          find: new RegExp(`^${name}$`),
          replacement: root + source,
        })),
        dedupe: ["react", "react-dom", "react-iiif-vault", "styled-components"],
      },
      server: { fs: { allow: [root] } },
    });
  },
};
export default config;
