import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["apps/web/test/**/*.test.tsx"],
    environment: "jsdom",
  },
});
