import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  minify: !options.watch,
  exports: true,
  entry: {
    index: "src/index.tsx",
  },
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
}));
