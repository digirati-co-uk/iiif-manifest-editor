import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { Vault } from "@iiif/helpers/vault";
import { VaultProvider } from "react-iiif-vault";
import { EditorInstance } from "@manifest-editor/editor-api";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales } from "@manifest-editor/i18n/core";
import { useVaultEditSession as actualEditSession } from "../../shell/src/History/use-edit-session";
import { useDecayState as actualDecayState } from "../../shell/src/hooks/use-decay-state";
import { RangeOverview } from "../src/definitions/RangeOverview/RangeOverview";

const shell = vi.hoisted(() => ({
  editor: undefined as EditorInstance<any> | undefined,
  vault: undefined as Vault | undefined,
  edit: vi.fn(),
  create: vi.fn(),
}));
vi.mock("@manifest-editor/shell", () => ({
  useEditor: () => shell.editor,
  useEditingResource: () => ({ resource: { source: { id: "urn:range", type: "Range" } } }),
  useCreator: () => [true, { edit: shell.edit, create: shell.create }],
  useConfig: () => ({ i18n: { defaultLanguage: "en", availableLanguages: ["en"], advancedLanguageMode: false } }),
  useDecayState: (time: number) => actualDecayState(time),
  useVaultEditSession: (...args: Parameters<typeof actualEditSession>) => actualEditSession(...args),
}));
vi.mock("react-iiif-vault", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-iiif-vault")>()),
  useClosestLanguage: () => "en",
}));

const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];
async function mount(child: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  const i18n = createEditorI18n({ locales: defaultLocales, config: { defaultLocale: "en-GB" } });
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={i18n}>
        <ThemeProvider theme={{ padding: {}, color: {}, sizes: {} }}>
          <VaultProvider vault={shell.vault!}>{child}</VaultProvider>
        </ThemeProvider>
      </EditorI18nProvider>
    )
  );
  return container;
}
afterEach(async () => {
  for (const { root, container } of mounted.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
  vi.clearAllMocks();
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup(range: Record<string, unknown>) {
  const vault = new Vault();
  vault.loadManifestSync("urn:manifest", {
    id: "urn:manifest",
    type: "Manifest",
    label: { en: ["Manifest"] },
    items: [{ id: "urn:canvas", type: "Canvas", label: { en: ["Excluded canvas"] }, width: 10, height: 10, items: [] }],
    structures: [{ id: "urn:range", type: "Range", label: { en: ["Parent"] }, ...range }],
  });
  shell.vault = vault;
  shell.editor = new EditorInstance({ vault, reference: { id: "urn:range", type: "Range" } });
}

it("shows label, summary and required statement fields and lists only the sub-ranges", async () => {
  setup({
    summary: { en: ["A summary"] },
    requiredStatement: { label: { en: ["Attribution"] }, value: { en: ["Provided by us"] } },
    items: [
      { id: "urn:child-1", type: "Range", label: { en: ["First child"] }, items: [] },
      { id: "urn:canvas", type: "Canvas" },
      { id: "urn:child-2", type: "Range", label: { en: ["Second child"] }, items: [] },
    ],
  });
  const container = await mount(<RangeOverview />);
  const text = container.textContent || "";
  expect(text).toContain("Parent");
  expect(text).toContain("A summary");
  expect(text).toContain("Attribution");
  expect(text).toContain("Provided by us");
  expect(text).toContain("First child");
  expect(text).toContain("Second child");
  // The canvas member is not a sub-range.
  expect(text).not.toContain("Excluded canvas");
});

it("still offers a summary and required statement when the range has none", async () => {
  setup({ items: [] });
  const container = await mount(<RangeOverview />);
  expect(container.querySelector(`[id="${shell.editor!.descriptive.summary.containerId()}"]`)).toBeTruthy();
  expect(container.querySelector(`[id="${shell.editor!.descriptive.requiredStatement.containerId()}"]`)).toBeTruthy();
});
