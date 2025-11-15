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
  minify: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: "index.css",
    }),
  ],
}));
