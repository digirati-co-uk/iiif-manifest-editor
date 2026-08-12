import { esmExternalRequirePlugin } from "rolldown/plugins";
import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  tsconfig: "tsconfig.build.json",
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  deps: {
    alwaysBundle: ["react-accessible-dropdown-menu-hook"],
    dts: { neverBundle: ["@manifest-editor/ui"] },
  },
  exports: {
    customExports: (exports) => {
      exports["./dist/index.css"] = "./dist/index.css";
      return exports;
    },
  },
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
  define: {
    "global.setImmediate": "window.setImmediate",
  },
  plugins: [esmExternalRequirePlugin({ external: ["react"] })],
}));
