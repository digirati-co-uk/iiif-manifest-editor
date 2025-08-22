import { defineConfig } from "tsdown";
import postcss from "rollup-plugin-postcss";
// @ts-expect-error
import postcssImport from "postcss-import";

export default defineConfig((options) => ({
  dts: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  clean: !options.watch,
  external: [
    // -
    "@iiif/parser",
    "@iiif/helpers",
  ],
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: 'index.css',
    }),
  ],
}));
