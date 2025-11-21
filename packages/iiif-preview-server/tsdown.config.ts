import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  clean: !options.watch,
  target: ["es2020"],
  exports: true,
  format: ["esm", "cjs"],
  platform: "node",
  entry: {
    index: "src/index.ts",
    "next-app-router": "src/wrappers/next-app-router.ts",
    netlify: "src/stores/netlify-blob.ts",
  },
  external: ["next/server"],
}));
