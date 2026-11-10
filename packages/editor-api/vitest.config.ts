import { fileURLToPath } from "node:url";

/** Exercise workspace source without running package builds. */
export default {
  resolve: {
    alias: {
      "@manifest-editor/editor-api": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
  test: { include: ["packages/editor-api/tests/*.test.ts"] },
};
