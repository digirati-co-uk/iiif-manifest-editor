import { defineConfig } from "tsdown";
import postcssImport from "postcss-import";
import postcssModulesRollup from "rollup-plugin-postcss-modules"

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
  sourcemap: true,
  plugins: [
    postcssModulesRollup({
      plugins: [
        postcssImport(),
      ],
      modules: {
        localsConvention: 'camelCase',
        globalModulePaths: [/index\.css/],
      },
      extract: 'index.css',
    }),
  ],
}));
