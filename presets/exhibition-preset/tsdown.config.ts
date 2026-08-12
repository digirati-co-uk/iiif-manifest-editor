import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  css: {
    fileName: "index.css",
    transformer: "postcss",
  },
  minify: !options.watch,
  exports: {
    customExports: (exports) => {
      exports["./dist/index.css"] = "./dist/index.css";
      return exports;
    },
  },
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  sourcemap: true,
  entry: {
    index: "src/index.tsx",
  },
}));
