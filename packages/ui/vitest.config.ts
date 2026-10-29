import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: { environment: "jsdom", include: ["test/**/*.test.tsx", "test/**/*.test.ts"] },
});
