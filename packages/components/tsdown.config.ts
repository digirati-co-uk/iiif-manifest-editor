import { defineConfig } from "tsdown";

export default defineConfig((config) => ({
  dts: true,
  banner: {
    js: "'use client'",
  },
  clean: !config.watch,
  css: {
    fileName: "lib.css",
    transformer: "postcss",
  },
  exports: {
    customExports: (exports) => {
      exports["./dist/lib.css"] = "./dist/lib.css";
      return exports;
    },
  },
  minify: !config.watch,
  sourcemap: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  entry: {
    index: "./src/index.tsx",
  },
}));
