// @ts-expect-error
import postcssImport from "postcss-import";
import postcssModulesRollup from "rollup-plugin-postcss-modules";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  exports: {
    customExports: (exports) => {
      exports["./dist/index.css"] = "./dist/index.css";
      return exports;
    },
  },
  clean: !options.watch,
  minifi: !options.watch,
  define: {
    "global.setImmediate": "window.setImmediate",
  },
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
