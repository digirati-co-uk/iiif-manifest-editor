import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { analyseSource, audit, markdown } from "./audit-i18n.mjs";

test("finds display text, accessibility, module definitions and dynamic messages", () => {
  const result = analyseSource(
    "example.tsx",
    `
    export const panel = { id: "canvas-panel", label: "Canvas", "title": "Panel title" };
    function Panel({ count }) {
      return <p aria-label="Canvas tools" title={"Help"}>Hello {count}<b>world</b>{count ? "One" : "Many"}</p>;
    }
    confirm(\`Remove \${count} canvases?\`);
    toast.error("Could not save");
    console.error("Developer diagnostics");
    const path = "https://example.org";
    type Thing = { label: "Protocol" };
    // label: "Comment"
  `
  );
  assert.deepEqual(result.errors, []);
  const texts = result.candidates.map((item) => item.text);
  for (const value of [
    "Canvas",
    "Panel title",
    "Canvas tools",
    "Help",
    "Hello",
    "world",
    "One",
    "Many",
    "Remove {{expression1}} canvases?",
    "Could not save",
  ])
    assert.ok(texts.includes(value), value);
  for (const value of ["canvas-panel", "Developer diagnostics", "https://example.org", "Protocol", "Comment", "title"])
    assert.ok(!texts.includes(value), value);
  assert.ok(result.candidates.find((item) => item.text === "Canvas").flags.includes("module-definition"));
  assert.ok(result.candidates.find((item) => item.text.startsWith("Remove")).flags.includes("interpolation"));
});

test("skips migrated messages and keeps locations after Unicode and newlines", () => {
  const result = analyseSource(
    "example.tsx",
    `// 日本語\nconst a = <p>Save</p>;\nt("Already translated");\nconst b = <Trans>Rich message</Trans>;\nconst c = msg\`Translated template\`;\nnew Intl.NumberFormat("en");\n`
  );
  assert.deepEqual(
    result.candidates.map((item) => item.text),
    ["Save"]
  );
  assert.equal(result.candidates[0].line, 2);
  assert.equal(result.candidates[0].column, 14);
  assert.equal(result.risks[0].kind, "formatting-review");
});

test("parsing failures are reported", () => {
  assert.ok(analyseSource("broken.tsx", "const x = <p>").errors.length > 0);
});

test("does not mistake JSX comparisons and conditional tests for visible strings", () => {
  const result = analyseSource(
    "example.tsx",
    'const C = () => <p>{mode === "scroll" ? "Scrolling view" : "Slides"}{kind === "canvas" && "Visible"}</p>;'
  );
  assert.deepEqual(
    result.candidates.map((item) => item.text),
    ["Scrolling view", "Slides", "Visible"]
  );
});

test("inventory separates legacy and test scopes and is deterministic", async () => {
  const root = await mkdtemp(join(tmpdir(), "manifest-editor-i18n-"));
  try {
    await mkdir(join(root, "src/LegacyManifestEditor"), { recursive: true });
    await writeFile(join(root, "src/current.tsx"), "export const C = () => <p>Current</p>;");
    await writeFile(join(root, "src/LegacyManifestEditor/old.tsx"), "export const C = () => <p>Old</p>;");
    await writeFile(join(root, "src/current.test.tsx"), "export const C = () => <p>Test</p>;");
    const result = await audit({ root, scopes: ["src"] });
    assert.equal(result.summary.filesScanned, 2);
    assert.equal(result.summary.legacyOccurrences, 1);
    assert.equal(result.summary.nonLegacyOccurrences, 1);
    assert.deepEqual(result, await audit({ root, scopes: ["src"] }));
    assert.equal((await audit({ root, scopes: ["src"], includeTests: true })).summary.filesScanned, 3);
    assert.match(markdown(result), /Candidates require review/);
    assert.equal((await audit({ root, scopes: ["missing"] })).scope.missingScopes[0], "missing");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
