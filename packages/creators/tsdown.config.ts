// @ts-expect-error
import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  clean: !options.watch,
  minify: !options.watch,
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: "index.css",
    }),
  ],
}));
