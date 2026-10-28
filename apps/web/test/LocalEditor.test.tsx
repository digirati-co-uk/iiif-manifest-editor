import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useVault } from "react-iiif-vault";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs } from "@manifest-editor/i18n/nl";
import LocalEditor from "../src/components/local-editor/LocalEditor";

const files = vi.hoisted(() => ({ open: vi.fn(), save: vi.fn() }));
vi.mock("browser-fs-access", () => ({ supported: true, fileOpen: files.open, fileSave: files.save }));
// The facade and its real providers/Vault run; native layouts and external I/O are boundary fixtures.
vi.mock("manifest-editor", async () => import("../../../packages/manifest-editor/src/ManifestEditor"));
vi.mock("@manifest-editor/manifest-preset", () => ({
  default: { id: "local-test", title: "Local test" },
  config: { notebook: { enabled: false } },
  preset: {},
  plugins: [],
}));
vi.mock("@manifest-editor/collection-preset", () => ({
  collectionPreset: { metadata: { id: "local-collection", title: "Local collection" }, layout: {} },
}));
vi.mock("@manifest-editor/shell", async (original) => ({
  ...(await original<typeof import("@manifest-editor/shell")>()),
  Layout: () => <LocalDraft />,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let loadedVault!: ReturnType<typeof useVault>;
function LocalDraft() {
  loadedVault = useVault();
  const [draft, setDraft] = useState("Unsaved local draft");
  return (
    <div>
      <input aria-label="Local draft fixture" value={draft} readOnly />
      <button onClick={() => setDraft("Changed local draft")}>Change draft fixture</button>
    </div>
  );
}
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.replaceChildren();
  vi.clearAllMocks();
});
function button(text: string) {
  const result = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (element) => element.textContent === text
  );
  expect(result, text).toBeTruthy();
  return result!;
}
it("opens a local manifest with the actual facade, retaining its draft and Welsh data through language changes and failed saves", async () => {
  const manifest = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/local",
    type: "Manifest",
    label: { cy: ["Teitl lleol"] },
    items: [],
  };
  const file = {
    name: "teitl-lleol.json",
    lastModified: Date.UTC(2026, 1, 1),
    text: async () => JSON.stringify(manifest),
    handle: {},
  };
  files.open.mockResolvedValue(file);
  files.save.mockRejectedValue(new Error("disk unavailable"));
  const runtime = createEditorI18n({ locales: [...defaultLocales, dutchLocale], catalogs: dutchCatalogs });
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime}>
        <LocalEditor />
      </EditorI18nProvider>
    )
  );
  await act(async () => button("Open file").click());
  const draft = document.querySelector<HTMLInputElement>('[aria-label="Local draft fixture"]')!;
  expect(draft).not.toBeNull();
  expect(document.querySelector("header a[href='/'] svg")).not.toBeNull();
  expect(files.open).toHaveBeenCalledTimes(1);
  await act(async () => button("Change draft fixture").click());
  const content = JSON.stringify(loadedVault.toPresentation3({ id: manifest.id, type: "Manifest" }));
  expect(JSON.parse(content).label).toEqual(manifest.label);
  await act(async () => runtime.setLocale("nl"));
  expect(document.querySelector('[aria-label="Local draft fixture"]')).toBe(draft);
  expect(draft.value).toBe("Changed local draft");
  expect(JSON.stringify(loadedVault.toPresentation3({ id: manifest.id, type: "Manifest" }))).toBe(content);
  await act(async () => button(runtime.translate("web")("actions.save")).click());
  expect(files.save).toHaveBeenCalledTimes(1);
  expect(files.save.mock.calls[0]?.[1]).toEqual({ fileName: file.name, extensions: [".json"] });
  expect(files.save.mock.calls[0]?.[2]).toBe(file.handle);
  expect(document.querySelector('[role="alert"]')?.textContent).toBe(runtime.translate("web")("feedback.saveFailed"));
  expect(document.querySelector('[aria-label="Local draft fixture"]')).toBe(draft);
  expect(draft.value).toBe("Changed local draft");
});
