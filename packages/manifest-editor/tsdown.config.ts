import { defineConfig } from "tsdown";
import postcss from "rollup-plugin-postcss";
// @ts-expect-error
import postcssImport from "postcss-import";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  external: [
    // -
    "@iiif/parser",
    "@iiif/helpers",
  ],
  define: {
    "global.setImmediate": "window.setImmediate",
  },
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: 'index.css',
    }),
  ],
}));
