import { type Options, defineConfig } from "tsup";

export default defineConfig((options: Options) => ({
  dts: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  entry: {
    index: "src/index.tsx",
    components: "src/components.tsx",
  },

  external: [
    // -
    "@iiif/parser",
    "@iiif/helpers",
  ],
  ...options,
}));
