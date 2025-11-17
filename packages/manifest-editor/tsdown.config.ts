// @ts-expect-error
import postcssImport from "postcss-import";
import postcss from "rollup-plugin-postcss";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: {
    customExports: (exports) => {
      exports["./dist/index.css"] = "./dist/index.css";
      return exports;
    },
  },
  clean: !options.watch,
  minify: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  define: {
    "global.setImmediate": "window.setImmediate",
  },
  plugins: [
    (postcss as any as typeof postcss.default)({
      plugins: [postcssImport()],
      extract: "index.css",
    }),
  ],
}));
