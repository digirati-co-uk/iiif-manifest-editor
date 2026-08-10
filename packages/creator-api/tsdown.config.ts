import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  deps: { dts: { neverBundle: ["react"] } },
  exports: true,
  clean: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  minify: !options.watch,
  sourcemap: true,
}));
