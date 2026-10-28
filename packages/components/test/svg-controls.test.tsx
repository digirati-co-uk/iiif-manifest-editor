import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import mitt from "mitt";
import { AtlasStoreProvider, createAtlasStore, type AtlasStoreEvents } from "react-iiif-vault";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs } from "@manifest-editor/i18n/nl";
import { SvgEditorControls } from "../src/SvgEditorControls";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});
async function mount(children: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => root.render(children));
  return container;
}
const runtime = () => createEditorI18n({ locales: [...defaultLocales, dutchLocale], catalogs: dutchCatalogs });

it("translates named shape actions and preserves the actual selected tool, geometry and button identity", async () => {
  const i18n = runtime();
  const events = mitt<AtlasStoreEvents>();
  const store = createAtlasStore({
    events,
    enabledTools: ["box", "pen", "pointer", "hand", "pencil", "line", "lineBox", "stamp"],
  });
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <AtlasStoreProvider existing={store}>
        <SvgEditorControls icons={{ PenIcon: <svg aria-label="decorative polygon" /> }} />
      </AtlasStoreProvider>
    </EditorI18nProvider>
  );
  const polygon = container.querySelector<HTMLButtonElement>('button[aria-label="Polygon"]')!;
  expect(polygon).not.toBeNull();
  const ticket = store.getState().getRequestId();
  let completion!: ReturnType<ReturnType<typeof store.getState>["requestAnnotation"]>;
  await act(async () => {
    completion = store.getState().requestAnnotation(
      {
        type: "polygon",
        points: [
          [10, 20],
          [50, 20],
          [50, 40],
          [10, 40],
        ],
        open: false,
      },
      { requestId: ticket.requestId, toolId: "pointer" }
    );
    polygon.click();
    try {
      await vi.waitFor(() => expect(store.getState().polygonState.currentTool).toBe("pen"));
    } finally {
      store.getState().polygons.clock.stop();
    }
  });
  expect(store.getState().polygonState.currentTool).toBe("pen");
  expect(polygon.getAttribute("aria-pressed")).toBe("true");
  const shape = store.getState().polygonState;
  const tool = store.getState().tool;
  const geometry = store.getState().polygon;
  expect(geometry?.points).toEqual([
    [10, 20],
    [50, 20],
    [50, 40],
    [10, 40],
  ]);
  let changes = 0;
  const unsubscribe = store.subscribe(() => changes++);
  await act(async () => i18n.setLocale("nl"));
  expect(container.querySelector('button[aria-label="Veelhoek"]')).toBe(polygon);
  expect(polygon.getAttribute("aria-pressed")).toBe("true");
  expect(store.getState().polygonState).toBe(shape);
  expect(store.getState().tool).toBe(tool);
  expect(store.getState().polygon).toBe(geometry);
  expect(changes).toBe(0);
  expect(container.textContent).not.toMatch(/pointer|lineBox|pencil/);
  expect(container.querySelectorAll("button")).toHaveLength(11);
  for (const button of container.querySelectorAll("button")) {
    expect(button.getAttribute("aria-label")).toBeTruthy();
    expect(button.type).toBe("button");
  }
  unsubscribe();
  await act(async () => store.getState().cancelRequest(ticket.requestId));
  await completion;
});

it("keeps editor locales isolated and forwards only enabled, visible actions", async () => {
  const a = runtime(),
    b = runtime();
  await b.setLocale("nl");
  const leftStore = createAtlasStore({ events: mitt() });
  const rightStore = createAtlasStore({ events: mitt() });
  const left = await mount(
    <EditorI18nProvider instance={a}>
      <AtlasStoreProvider existing={leftStore}>
        <SvgEditorControls enabled={{ box: true }} />
      </AtlasStoreProvider>
    </EditorI18nProvider>
  );
  const right = await mount(
    <EditorI18nProvider instance={b}>
      <AtlasStoreProvider existing={rightStore}>
        <SvgEditorControls showShapes={false} enabled={{ delete: true }} />
      </AtlasStoreProvider>
    </EditorI18nProvider>
  );
  expect([...left.querySelectorAll("button")].map((button) => button.getAttribute("aria-label"))).toEqual([
    "Select",
    "Pan",
    "Rectangle",
  ]);
  expect([...right.querySelectorAll("button")].map((button) => button.getAttribute("aria-label"))).toEqual([
    "Selecteren",
    "Verschuiven",
    "Selectie verwijderen",
  ]);
  await act(async () => left.querySelector<HTMLButtonElement>('button[aria-label="Rectangle"]')!.click());
  expect(leftStore.getState().polygonState.currentTool).toBe("box");
  expect(leftStore.getState().mode).toBe("sketch");
  expect(rightStore.getState().mode).toBe("explore");
});
