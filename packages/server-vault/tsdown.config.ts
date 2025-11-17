import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: true,
  clean: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "node",
}));
