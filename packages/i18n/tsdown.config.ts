import { defineConfig } from "tsdown";
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  // Preserve the React client boundary when tsdown combines the entry modules.
  banner: { js: "'use client';" },
  exports: false,
  platform: "neutral",
  target: "es2022",
  // Only authoring helpers/data are bundled. Consumers must keep this runtime external.
  noExternal: [/^@manifest-editor\/languages(?:\/|$)/],
  external: ["react", "react/jsx-runtime", "i18next", "react-i18next"],
});
