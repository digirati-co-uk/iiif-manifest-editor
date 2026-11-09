// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", "test", "dist"].includes(entry.name)) return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : [];
  });
}
it("keeps runtime consumers on the public shared context and private catalogs out of UI source", () => {
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  expect(manifest.dependencies["@manifest-editor/i18n"]).toBe("workspace:*");
  for (const path of sourceFiles(root)) {
    const source = readFileSync(path, "utf8");
    expect(source, path).not.toMatch(/from\s+["']@manifest-editor\/languages/);
    expect(source, path).not.toMatch(/from\s+["']react-i18next/);
    expect(source, path).not.toMatch(/createContext.*(?:I18n|i18n)/);
  }
});
it("retains the existing exported media, form and modal entry points", () => {
  const { exports } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  for (const key of [
    "./MediaControls",
    "./VideoPlayer",
    "./ViewControls",
    "./DeleteButton",
    "./EmptyCanvasState",
    "./CenterPanelContainer",
    "./madoc/components/ModalButton",
    "./editors/Input",
    "./atoms/*",
  ]) {
    expect(exports[key], key).toBeTypeOf("string");
  }
});
