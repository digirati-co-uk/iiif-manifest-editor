import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { VaultProvider, ManifestContext, CanvasContext } from "react-iiif-vault";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import {
  ContextMenuProvider,
  useResourceContextMenuItems,
  type ContextMenuItem,
} from "../../../packages/shell/src/ContextMenu/ContextMenuContext";
import { contextMenus } from "../src/context-menus";

const fixture = vi.hoisted(() => ({ edit: vi.fn(), create: vi.fn(), creator: vi.fn() }));
// Fixture only the surrounding layout/creator actions. The preset component,
// Vault, menu store/registration, provider and translation runtime remain real.
vi.mock("@manifest-editor/shell", async (original) => ({
  ...(await original<typeof import("@manifest-editor/shell")>()),
  useLayoutActions: () => ({ edit: fixture.edit }),
  useCreator: () => [true, { create: fixture.create, creator: fixture.creator }],
}));

it("retranslates an actual retained preset menu and preserves bound IDs/actions across provider replacement", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const vault = new Vault(),
    m = "https://example.org/manifest",
    c = `${m}/canvas/1`;
  vault.loadManifestSync(m, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: m,
    type: "Manifest",
    label: { cy: ["Eitem"] },
    items: [{ id: c, type: "Canvas", label: { cy: ["Tudalen"] }, items: [] }],
  });
  const original = vault.toPresentation3({ id: m, type: "Manifest" });
  const options = {
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  };
  const runtime = createEditorI18n(options),
    replacement = createEditorI18n({ ...options, config: { defaultLocale: "nl", defaultProfile: "plain" } });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  let retained: ContextMenuItem | undefined;
  function Probe() {
    const sections = useResourceContextMenuItems({ id: c, type: "Canvas" });
    const item = sections.flatMap((section) => section.items).find((item) => item.id === "add-browser");
    if (item && !retained) retained = item;
    return (
      <div>
        {sections.map((section, index) => (
          <section key={index}>
            <h2>{section.sectionTitle}</h2>
            {section.items.map((item) => (
              <span key={item.id}>{item.label}</span>
            ))}
          </section>
        ))}
      </div>
    );
  }
  function Tree({ instance }: { instance: typeof runtime }) {
    return (
      <EditorI18nProvider instance={instance}>
        <VaultProvider vault={vault}>
          <ManifestContext manifest={m}>
            <CanvasContext canvas={c}>
              <ContextMenuProvider>
                {contextMenus.render()}
                <Probe />
              </ContextMenuProvider>
            </CanvasContext>
          </ManifestContext>
        </VaultProvider>
      </EditorI18nProvider>
    );
  }
  try {
    await act(async () => root.render(<Tree instance={runtime} />));
    expect(retained?.label).toBe("Add from IIIF Browser");
    const action = retained!.onAction;
    await act(async () => runtime.select({ locale: "nl", profile: "plain" }));
    expect(retained!.label).toBe("Toevoegen uit IIIF-browser");
    expect(container.textContent).toContain("Pagina");
    await act(async () => root.render(<Tree instance={replacement} />));
    await act(async () => replacement.select({ locale: "en-GB", profile: "plain" }));
    expect(retained!.label).toBe("Add from IIIF Browser");
    expect(container.textContent).toContain("Page");
    expect(retained!.id).toBe("add-browser");
    expect(retained!.onAction).toBe(action);
    retained!.onAction({ resource: { id: c, type: "Canvas" }, position: { x: 0, y: 0 } });
    expect(fixture.edit).toHaveBeenCalledWith({ id: c, type: "Canvas" });
    expect(fixture.creator).toHaveBeenCalledWith("@manifest-editor/iiif-browser-creator");
    expect(vault.toPresentation3({ id: m, type: "Manifest" })).toEqual(original);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
