import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  dts: true,
  external: [/^@manifest-editor\/i18n(?:\/|$)/],
  clean: !options.watch,
  minify: !options.watch,
  exports: true,
  target: ["es2020"],
  format: ["esm", "cjs"],
  platform: "browser",
  sourcemap: true,
}));
