import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  dts: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",

  external: [
    // -
    "@iiif/parser",
    "@iiif/helpers",
  ],
  loader: {
    ".css": "local-css",
  },
  define: {
    global: "window",
  },
  ...options,
}));
