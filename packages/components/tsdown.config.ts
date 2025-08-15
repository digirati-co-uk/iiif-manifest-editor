import { defineConfig, type Options } from "tsdown";
import postcss from "rollup-plugin-postcss";
// @ts-expect-error
import postcssImport from "postcss-import";

export default defineConfig((config) => ({
  dts: true,
  banner: {
    js: "'use client'",
  },
  clean: !config.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  external: [
    // -
    "@iiif/helpers",
    "react-aria-components",
  ],
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: 'index.css',
    }),
  ],
}));
