import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  resolve: {
    alias: { "@manifest-editor/client-vault": fileURLToPath(new URL("../client-vault/src/index.ts", import.meta.url)) },
  },
  test: { include: ["packages/server-vault/src/**/*.test.ts", "packages/client-vault/src/**/*.test.ts"] },
});
