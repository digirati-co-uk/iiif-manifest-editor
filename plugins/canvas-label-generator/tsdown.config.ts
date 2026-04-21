import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  minify: !options.watch,
  target: ["es2022"],
  format: ["esm", "cjs"],
  platform: "browser",
  entry: {
    index: "src/index.ts",
  },
}));
