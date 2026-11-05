import { defineConfig } from "tsdown";
export default defineConfig({
  dts: true,
  target: ["es2022"],
  format: ["esm", "cjs"],
  platform: "browser",
  sourcemap: true,
  entry: { index: "src/index.ts", lazy: "src/lazy.ts" },
});
