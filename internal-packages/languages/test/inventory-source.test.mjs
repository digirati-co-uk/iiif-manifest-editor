import assert from "node:assert/strict";
import test from "node:test";
import { isSourceFile } from "../scripts/inventory-source.mjs";

test("module inventory excludes generated bundles and separates supporting source", () => {
  for (const file of [
    "apps/web/public/remote-editor/assets/hash/runtime.js",
    "apps/docs/public/_pagefind/ui.js",
    "packages/shell/dist/index.js",
    "packages/shell/node_modules/example/index.js",
    "packages/shell/src/fixtures/data.ts",
    "apps/web/next-env.d.ts",
  ]) {
    assert.equal(isSourceFile(file, true), false, file);
  }
  assert.equal(isSourceFile("apps/web/src/app/(main)/page.tsx"), true);
  assert.equal(isSourceFile("packages/shell/src/example.test.ts"), false);
  assert.equal(isSourceFile("packages/shell/src/example.test.ts", true), true);
  assert.equal(isSourceFile("packages/playwright/src/tests/editor.test.ts", true), true);
  assert.equal(isSourceFile("apps/docs/app/layout.tsx"), false);
  assert.equal(isSourceFile("apps/docs/app/layout.tsx", true), true);
});
