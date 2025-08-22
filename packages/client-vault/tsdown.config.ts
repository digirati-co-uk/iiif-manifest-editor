import { defineConfig, type Options } from "tsdown";

export default defineConfig((options: Options) => ({
  dts: true,
  banner: {
    js: "'use client'",
  },
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  external: [
    // -
    "@iiif/helpers",
  ],
  ...options,
}));
