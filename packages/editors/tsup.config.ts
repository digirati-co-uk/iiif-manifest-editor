import { type Options, defineConfig } from "tsup";

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
    "global.setImmediate": "window.setImmediate",
  },
  ...options,
}));
