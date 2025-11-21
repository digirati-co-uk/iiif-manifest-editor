import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  exports: true,
  banner: {
    js: "'use client'",
  },
  clean: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  minify: !options.watch,
}));
