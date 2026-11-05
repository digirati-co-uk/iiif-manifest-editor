// @vitest-environment jsdom
import { Vault } from "@iiif/helpers/vault";
import { modifyEntityField } from "@iiif/helpers/vault/actions";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VaultProvider } from "react-iiif-vault";
import { afterEach, expect, test, vi } from "vitest";
import { normalizeDocument } from "./comparison";
import { createDiffStore, getDiffStore } from "./store";

const host = vi.hoisted(() => ({
  layout: {
    leftPanel: { open: true, current: "@manifest-editor/diff/sidebar" },
    rightPanel: { open: true },
  },
  centerPanel: { open: vi.fn(), popStack: vi.fn() },
  rightPanel: { open: vi.fn(), close: vi.fn() },
  edit: vi.fn(),
  resource: { id: "https://example.org/manifest", type: "Manifest" },
}));
vi.mock("@manifest-editor/shell", () => ({
  useAppResource: () => host.resource,
  useLayoutActions: () => ({ centerPanel: host.centerPanel, rightPanel: host.rightPanel, edit: host.edit }),
  useLayoutState: () => host.layout,
}));
vi.mock("@manifest-editor/components", () => ({
  Sidebar: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
  SidebarHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  SidebarContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ActionButton: ({ children, onPress, isDisabled, primary, ...props }: any) => (
    <button {...props} disabled={isDisabled} onClick={onPress}>
      {children}
    </button>
  ),
  Spinner: () => <svg />,
  DownloadIcon: () => <svg />,
  CloseIcon: () => <svg />,
  CanvasThumbnailGridItem: ({ id }: { id: string }) => <div data-testid="thumbnail">{id}</div>,
}));
import { background, centerPanels, leftPanels } from "./panels";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let container: HTMLDivElement;
afterEach(async () => {
  vi.unstubAllGlobals();
  localStorage.clear();
  host.layout.leftPanel.open = true;
  host.layout.rightPanel.open = true;
  await act(async () => root?.unmount());
  container?.remove();
  vi.clearAllMocks();
});
async function render(vault: Vault, children: ReactNode) {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<VaultProvider vault={vault}>{children}</VaultProvider>));
}
const original = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  ...host.resource,
  label: { en: ["Original"] },
  items: [
    { id: "https://example.org/canvas", type: "Canvas", label: { en: ["One"] }, width: 100, height: 100, items: [] },
  ],
};

test("opening the Diff sidebar opens the main panel", async () => {
  const vault = new Vault();
  await render(vault, background[0].render());
  expect(host.centerPanel.open).toHaveBeenCalledWith({ id: "@manifest-editor/diff/main", stacked: true });
});

test("opening the Diff sidebar loads the document ID automatically", async () => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(original)));
  vi.stubGlobal("fetch", fetchMock);
  const vault = new Vault();
  await render(vault, background[0].render());
  await vi.waitFor(() => expect(getDiffStore(vault, host.resource.id).getState().source).toBeDefined());
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("an unresolvable source fails silently and leaves the URL field available", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, structuredClone(original));
  await render(
    vault,
    <>
      {background[0].render()}
      {leftPanels[0].render(undefined, {} as any, {} as any)}
    </>
  );
  const store = getDiffStore(vault, host.resource.id);
  await vi.waitFor(() => expect(store.getState().loading).toBe(false));
  expect(store.getState().source).toBeUndefined();
  expect(store.getState().error).toBeUndefined();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.querySelector("input")?.getAttribute("value")).toBe(host.resource.id);
});

test("a manual load reports failures", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 404 })));
  const store = getDiffStore(new Vault(), "https://example.org/other");
  await store.getState().load();
  expect(store.getState().error).toContain("404");
});

test("nested Vault edits update both panels and unified text preserves the exported patch", async () => {
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, structuredClone(original));
  const store = getDiffStore(vault, host.resource.id);
  store.setState({ source: { ...normalizeDocument(original), url: host.resource.id } });
  const sidebar = leftPanels[0].render(undefined, {} as any, {} as any);
  const main = <main>{centerPanels[0].render(undefined, {} as any, {} as any)}</main>;
  await render(
    vault,
    <>
      {sidebar}
      {main}
    </>
  );
  expect(container.textContent).toContain("No differences");
  await act(async () =>
    vault.dispatch(
      modifyEntityField({
        id: "https://example.org/canvas",
        type: "Canvas",
        key: "label",
        value: { en: ["Changed canvas"] },
      })
    )
  );
  expect(container.textContent).toContain("1changed");
  expect(container.querySelector("main")?.textContent).toContain("Changed canvas");
  await act(async () => store.getState().update({ view: "unified" }));
  const unified = container.querySelector('[aria-label="Unified diff"]');
  expect(unified?.textContent).toContain("+");
  expect(unified?.textContent).toContain('"Changed canvas"');
  expect(unified?.textContent).toContain("\n");
  expect(unified?.querySelectorAll("span").length).toBeGreaterThan(3);
});

test("undo restores the source value in the editor", async () => {
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, structuredClone(original));
  const store = getDiffStore(vault, host.resource.id);
  store.setState({ source: { ...normalizeDocument(original), url: host.resource.id } });
  await render(vault, centerPanels[0].render(undefined, {} as any, {} as any));
  await act(async () =>
    vault.dispatch(
      modifyEntityField({ id: "https://example.org/canvas", type: "Canvas", key: "label", value: { en: ["Edited"] } })
    )
  );
  expect(container.textContent).toContain("Edited");
  const undo = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Undo"))!;
  await act(async () => undo.click());
  expect(container.textContent).toContain("No differences");
  expect((vault.toPresentation3(host.resource) as any).items[0].label).toEqual({ en: ["One"] });
});

test("reordering lists the items that moved rather than the whole array", async () => {
  const many = (ids: string[]) => ({
    ...original,
    items: ids.map((n) => ({
      id: `https://example.org/canvas/${n}`,
      type: "Canvas",
      label: { en: [`Canvas ${n}`] },
      width: 1,
      height: 1,
      items: [],
    })),
  });
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, many(["1", "2", "3", "4", "5", "6", "7", "8"]));
  const store = getDiffStore(vault, host.resource.id);
  store.setState({
    source: { ...normalizeDocument(many(["1", "2", "3", "4", "5", "6", "7", "8"])), url: host.resource.id },
  });
  await render(vault, centerPanels[0].render(undefined, {} as any, {} as any));
  await act(async () =>
    vault.dispatch(
      modifyEntityField({
        id: host.resource.id,
        type: "Manifest",
        key: "items",
        value: ["8", "1", "2", "3", "4", "5", "6", "7"].map((n) => ({ id: `https://example.org/canvas/${n}`, type: "Canvas" })),
      })
    )
  );
  const text = container.textContent!;
  expect(text).toContain("1 moved");
  expect(text).toContain("Canvas 8");
  expect(text).toContain("3 unchanged");
  expect(text).not.toContain('"width"');
});

test("the editing sidebar is closed while the diff is open and handed back afterwards", async () => {
  const vault = new Vault();
  await render(vault, background[0].render());
  expect(host.rightPanel.close).toHaveBeenCalledTimes(1);
  expect(host.rightPanel.open).not.toHaveBeenCalled();
  await act(async () => root!.unmount());
  expect(host.rightPanel.open).toHaveBeenCalledTimes(1);
});

test("the sidebar is left alone when it was already closed", async () => {
  host.layout.rightPanel.open = false;
  await render(new Vault(), background[0].render());
  expect(host.rightPanel.close).not.toHaveBeenCalled();
  await act(async () => root!.unmount());
  expect(host.rightPanel.open).not.toHaveBeenCalled();
});

test("Open edits the changed resource in the right sidebar", async () => {
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, structuredClone(original));
  const store = getDiffStore(vault, host.resource.id);
  store.setState({ source: { ...normalizeDocument(original), url: host.resource.id } });
  await render(vault, centerPanels[0].render(undefined, {} as any, {} as any));
  await act(async () =>
    vault.dispatch(
      modifyEntityField({ id: "https://example.org/canvas", type: "Canvas", key: "label", value: { en: ["Edited"] } })
    )
  );
  const open = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Open"))!;
  await act(async () => open.click());
  expect(host.edit).toHaveBeenCalledWith(
    { id: "https://example.org/canvas", type: "Canvas" },
    undefined,
    expect.objectContaining({ forceOpen: true })
  );
});

test("an undone change can be redone, and survives a reload via localStorage", async () => {
  const vault = new Vault();
  vault.loadManifestSync(host.resource.id, structuredClone(original));
  const store = getDiffStore(vault, host.resource.id);
  store.setState({ source: { ...normalizeDocument(original), url: host.resource.id } });
  await render(vault, centerPanels[0].render(undefined, {} as any, {} as any));
  await act(async () =>
    vault.dispatch(
      modifyEntityField({ id: "https://example.org/canvas", type: "Canvas", key: "label", value: { en: ["Edited"] } })
    )
  );
  const find = (text: string) => [...container.querySelectorAll("button")].find((b) => b.textContent?.includes(text));
  await act(async () => find("Undo")!.click());
  expect(container.textContent).toContain("No differences");
  expect(container.textContent).toContain("Undone");
  expect(find("Redo")).toBeTruthy();
  expect(localStorage.getItem(`manifest-editor:diff:undone:${host.resource.id}`)).toContain("Edited");

  // A fresh store for the same document picks the entry back up.
  const reloaded = createDiffStore(host.resource.id);
  expect(reloaded.getState().undone).toHaveLength(1);

  await act(async () => find("Redo")!.click());
  expect((vault.toPresentation3(host.resource) as any).items[0].label).toEqual({ en: ["Edited"] });
  expect(find("Redo")).toBeUndefined();
  expect(localStorage.getItem(`manifest-editor:diff:undone:${host.resource.id}`)).toBeNull();
});
