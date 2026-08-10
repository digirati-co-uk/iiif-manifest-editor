import { esmExternalRequirePlugin } from "rolldown/plugins";
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
  deps: { alwaysBundle: ["react-accessible-dropdown-menu-hook"] },
  clean: !options.watch,
  css: {
    fileName: "index.css",
    transformer: "postcss",
    modules: {
      localsConvention: "camelCase",
      globalModulePaths: [/index\.css/],
    },
  },
  minify: !options.watch,
  sourcemap: true,
  plugins: [esmExternalRequirePlugin({ external: ["react"] })],
}));
