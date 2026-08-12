import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: { newContext: true },
  exports: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  ignoreWatch: ["src/**/*.d.ts", "src/**/*.d.ts.map"],
  clean: !options.watch,
  css: {
    fileName: "index.css",
    transformer: "postcss",
  },
  minify: !options.watch,
  sourcemap: true,
}));
