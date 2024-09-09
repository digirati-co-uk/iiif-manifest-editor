import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  dts: true,
  clean: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "node",
  entry: {
    index: "src/index.ts",
    "next-app-router": "src/wrappers/next-app-router.ts",
    netlify: "src/stores/netlify-blob.ts",
  },
  external: ["next/server"],
  ...options,
}));
