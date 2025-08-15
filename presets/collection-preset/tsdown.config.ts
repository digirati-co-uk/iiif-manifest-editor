import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",

  external: [
    // -
    "@iiif/parser",
    "@iiif/helpers",
  ],
}));
