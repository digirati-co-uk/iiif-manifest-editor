import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createWebI18n } from "../src/i18n/WebI18nProvider";
import { IIIFBrowserModal } from "../src/components/browser-editor/IIIFBrowserModal";
import type { Vault } from "@iiif/helpers";
import type { useBrowserStoreContext, useOutputStore, IIIFBrowserProps } from "iiif-browser";

const fixture = vi.hoisted(() => ({
  browser: undefined as ReturnType<typeof useBrowserStoreContext> | undefined,
  output: undefined as ReturnType<typeof useOutputStore> | undefined,
  vault: undefined as Vault | undefined,
  create: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: fixture.push }) }));
vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));
vi.mock("../src/components/browser-editor/browser-state", () => ({ createManifestFromId: fixture.create }));
// Add a probe to the real browser; do not replace its rendering, stores or translation adapter.
vi.mock("@manifest-editor/components", async () => {
  const { useEffect } = await import("react");
  const { useVault } = await import("react-iiif-vault");
  const { useBrowserStoreContext, useOutputStore } = await import("iiif-browser");
  const { LocalizedIIIFBrowser } = await import("../../../packages/components/src/IIIFBrowserI18n");
  const { Modal } = await import("../../../packages/components/src/Modal");
  function Probe() {
    const browser = useBrowserStoreContext(),
      output = useOutputStore(),
      vault = useVault();
    useEffect(() => {
      Object.assign(fixture, { browser, output, vault });
    }, [browser, output, vault]);
    return null;
  }
  return {
    Modal,
    LocalizedIIIFBrowser: (props: IIIFBrowserProps) => (
      <LocalizedIIIFBrowser {...props} plugins={[{ id: "host-probe", header: <Probe /> }, ...(props.plugins || [])]} />
    ),
  };
});
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal("CSS", { escape: (value: string) => value });
window.matchMedia = vi.fn().mockImplementation(() => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
}));
Element.prototype.scrollIntoView = () => {};
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.replaceChildren();
  vi.clearAllMocks();
});
it("updates the retained browser action label without resetting history, selection or resource data", async () => {
  fixture.create.mockResolvedValue({ id: "project-id" });
  const i18n = createWebI18n();
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={i18n}>
        <QueryClientProvider client={new QueryClient()}>
          <IIIFBrowserModal isOpen setIsOpen={() => {}} />
        </QueryClientProvider>
      </EditorI18nProvider>
    )
  );
  const id = "https://example.org/host-manifest";
  await act(async () => {
    await fixture.vault!.loadManifest(id, { id, type: "Manifest", label: { cy: ["Teitl Cymraeg"] }, items: [] });
    fixture.browser!.getState().resolve(id);
    fixture.output!.getState().replaceSelectedItems([{ id, type: "Manifest" }]);
  });
  const action = document.querySelector<HTMLButtonElement>('button[aria-label="Open manifest"]')!;
  expect(action).not.toBeNull();
  const selection = fixture.output!.getState().selectedItems;
  const history = fixture.browser!.getState().history;
  const content = JSON.stringify(fixture.vault!.getState());
  await act(async () => i18n.setLocale("nl"));
  expect(document.querySelector('button[aria-label="Manifest openen"]')).toBe(action);
  expect(fixture.output!.getState().selectedItems).toBe(selection);
  expect(fixture.browser!.getState().history).toBe(history);
  expect(JSON.stringify(fixture.vault!.getState())).toBe(content);
  await act(async () => action.click());
  expect(fixture.create).toHaveBeenCalledWith(id);
});
