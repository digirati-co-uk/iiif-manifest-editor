// @ts-expect-error
import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";
import { defineConfig } from "tsdown";

export default defineConfig((config) => ({
  dts: true,
  banner: {
    js: "'use client'",
  },
  clean: !config.watch,
  exports: {
    customExports: (exports) => {
      exports["./dist/lib.css"] = "./dist/lib.css";
      return exports;
    },
  },
  minify: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  entry: {
    index: "./src/index.tsx",
    lib: "./src/lib.css",
  },
  // plugins: [
  //   (postcss as any as typeof postcss.default)({
  //     plugins: [postcssImport()],
  //     extract: "index.css",
  //   }),
  // ],
}));
