import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { VaultProvider } from "react-iiif-vault";
import { createManifestEditorVault } from "@manifest-editor/client-vault";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n } from "@manifest-editor/i18n/core";
import { createHistoryAdapter, HistoryProvider, HistoryControls } from "./History";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const ref = { id: "m", type: "Manifest" as const };
function vault() {
  const v = createManifestEditorVault();
  v.loadSync("m", { ...ref, label: { en: ["Original"] }, items: [] });
  return v;
}

test("React snapshots remain stable until an actual history notification", () => {
  const v = vault(),
    adapter = createHistoryAdapter(v);
  expect(adapter.getSnapshot()).toBe(adapter.getSnapshot());
  const stop = adapter.subscribe(() => {});
  const before = adapter.getSnapshot();
  v.modifyEntityField(ref, "label", { en: ["New"] });
  expect(adapter.getSnapshot()).not.toBe(before);
  expect(adapter.getSnapshot().canUndo).toBe(true);
  stop();
});

test("keyboard history is scoped to its editor and leaves native fields alone", async () => {
  const a = vault(),
    b = vault(),
    element = document.createElement("div"),
    root = createRoot(element);
  document.body.append(element);
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={createEditorI18n()}>
          {[a, b].map((v, index) => (
            <VaultProvider key={index} vault={v}>
              <HistoryProvider>
                <HistoryControls />
                <button data-focus={index}>Focus</button>
                <input />
              </HistoryProvider>
            </VaultProvider>
          ))}
        </EditorI18nProvider>
      )
    );
    await act(async () => {
      a.modifyEntityField(ref, "label", { en: ["A"] });
      b.modifyEntityField(ref, "label", { en: ["B"] });
    });
    const buttons = element.querySelectorAll("[data-focus]");
    await act(async () =>
      buttons[0]!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true, cancelable: true })
      )
    );
    expect(a.get(ref).label).toEqual({ en: ["Original"] });
    expect(b.get(ref).label).toEqual({ en: ["B"] });
    const native = new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true, cancelable: true });
    await act(async () => element.querySelectorAll("input")[1]!.dispatchEvent(native));
    expect(native.defaultPrevented).toBe(false);
    expect(b.get(ref).label).toEqual({ en: ["B"] });
  } finally {
    await act(async () => root.unmount());
    element.remove();
  }
});

test("history controls report thrown failures and remain usable", async () => {
  const v = vault(),
    element = document.createElement("div"),
    root = createRoot(element);
  document.body.append(element);
  v.modifyEntityField(ref, "label", { en: ["Changed"] });
  const undo = v.undo.bind(v);
  v.undo = () => {
    throw new Error("History transport failed");
  };
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={createEditorI18n()}>
          <VaultProvider vault={v}>
            <HistoryProvider>
              <HistoryControls />
            </HistoryProvider>
          </VaultProvider>
        </EditorI18nProvider>
      )
    );
    const button = element.querySelector<HTMLButtonElement>('[data-history-action="undo"]')!;
    await act(async () => button.click());
    expect(element.querySelector("output")!.textContent).toBe("History transport failed");
    v.undo = undo;
    await act(async () => button.click());
    expect(v.get(ref).label).toEqual({ en: ["Original"] });
    expect(element.querySelector("output")!.textContent).toBe("");
  } finally {
    await act(async () => root.unmount());
    element.remove();
  }
});
