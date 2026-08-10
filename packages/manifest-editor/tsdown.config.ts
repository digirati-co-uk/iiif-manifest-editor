import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: {
    customExports: (exports) => {
      exports["./dist/index.css"] = "./dist/index.css";
      exports["./reset.css"] = "./reset.css";
      return exports;
    },
  },
  entry: {
    index: "./src/index.ts",
    "collection-preset": "./src/collection-preset.ts",
    components: "./src/components.ts",
    editors: "./src/editors.ts",
    "editor-api": "./src/editor-api.ts",
    creators: "./src/creators.ts",
    "creator-api": "./src/creator-api.ts",
    "manifest-preset": "./src/manifest-preset.ts",
    "exhibition-preset": "./src/exhibition-preset.ts",
    shell: "./src/shell.ts",
    parser: "./src/parser.ts",
    vault: "./src/vault.ts",
    helpers: "./src/helpers.ts",
  },
  clean: !options.watch,
  css: {
    fileName: "index.css",
    transformer: "postcss",
  },
  minify: !options.watch,
  sourcemap: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  define: {
    "global.setImmediate": "window.setImmediate",
  },
}));
