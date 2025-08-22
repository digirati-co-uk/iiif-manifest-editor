import { type Options, defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  clean: !options.watch,
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
}));
