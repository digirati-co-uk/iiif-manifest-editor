import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: {
      "@manifest-editor/shell": fileURLToPath(new URL("../shell/src/index.ts", import.meta.url)),
      "@manifest-editor/client-vault": fileURLToPath(new URL("../client-vault/src/index.ts", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  test: { environment: "jsdom", include: ["packages/projects/test/**/*.test.tsx"] },
});
