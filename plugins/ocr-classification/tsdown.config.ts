import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  minify: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  entry: {
    index: "src/index.ts",
  },
  copy: [{ from: "src/assets", to: "dist/assets" }],
}));
