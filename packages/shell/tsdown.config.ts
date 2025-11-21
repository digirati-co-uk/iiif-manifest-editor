// @ts-expect-error no types.
import postcssImport from "postcss-import";
import postcssModulesRollup from "rollup-plugin-postcss-modules";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: {
    customExports(exports) {
      exports["./dist/index.css"] = "./dist/index.css";
      return exports;
    },
  },
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  clean: !options.watch,
  minify: !options.watch,
  sourcemap: true,
  plugins: [
    postcssModulesRollup({
      plugins: [postcssImport()],
      modules: {
        localsConvention: "camelCase",
        globalModulePaths: [/index\.css/],
      },
      extract: "index.css",
    }),
  ],
}));
