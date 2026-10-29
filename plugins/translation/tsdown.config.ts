import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  external: [/^@manifest-editor\/i18n(?:\/|$)/],
  clean: !options.watch,
  minify: !options.watch,
  target: ["es2022"],
  format: ["esm", "cjs"],
  platform: "browser",
  sourcemap: true,
  entry: {
    index: "src/index.ts",
    lazy: "src/lazy.ts",
    "translation-worker": "src/runtime/worker/entry.ts",
  },
}));
