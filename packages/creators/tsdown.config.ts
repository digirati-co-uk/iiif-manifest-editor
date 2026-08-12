import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  clean: !options.watch,
  css: {
    fileName: "index.css",
    transformer: "postcss",
  },
  minify: !options.watch,
  sourcemap: true,
}));
