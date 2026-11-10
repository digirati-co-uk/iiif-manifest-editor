import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/editor-api": fileURLToPath(new URL("../editor-api/src/index.ts", import.meta.url)),
    },
  },
  test: { include: ["packages/creator-api/test/**/*.test.ts"] },
});
