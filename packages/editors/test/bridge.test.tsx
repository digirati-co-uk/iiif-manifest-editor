import { useEditorsI18nInstance, useEditorsTranslations } from "../src/editor-i18n-context";
import { useDisplayLabel } from "../src/i18n";
import { act, useLayoutEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import {
  EditorI18nProvider,
  useEditorI18n,
  useOptionalEditorI18nInstance,
  useTranslations,
} from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { EditorHTMLPortal, EditorI18nBoundary, EditorI18nBridgeContext } from "../src/components/EditorI18nBridge";

const detached = vi.hoisted(() => [] as Array<{ root: Root; container: HTMLDivElement }>);
// Atlas HTMLPortal also creates a separate DOM root. Reproduce that boundary without its canvas renderer.
vi.mock("@atlas-viewer/atlas", () => ({
  HTMLPortal: ({ children }: { children: ReactNode }) => {
    const target = useRef<(typeof detached)[number] | null>(null);
    useLayoutEffect(() => {
      if (!target.current) {
        const container = document.createElement("div");
        document.body.append(container);
        target.current = { container, root: createRoot(container) };
        detached.push(target.current);
      }
      target.current.root.render(children);
    }, [children]);
    return null;
  },
}));
const hosts: Array<{ root: Root; container: HTMLDivElement }> = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
afterEach(async () => {
  for (const item of [...hosts.splice(0), ...detached.splice(0)]) {
    await act(async () => item.root.unmount());
    item.container.remove();
  }
});
async function mount(node: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  hosts.push({ root, container });
  await act(async () => root.render(node));
  return container;
}
function runtime() {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });
}
function Controls() {
  const t = useTranslations("editors");
  const { setLocale } = useEditorI18n();
  return (
    <>
      <label>{t("canvas.add")}</label>
      <input defaultValue="Drafft Cymraeg" />
      <button onClick={() => void setLocale("nl")}>NL</button>
    </>
  );
}
it("keeps the same runtime and input through the separate Atlas DOM root", async () => {
  const instance = runtime();
  const seen = vi.fn();
  function Probe() {
    seen(useOptionalEditorI18nInstance());
    return <Controls />;
  }
  await mount(
    <EditorI18nProvider instance={instance}>
      <EditorHTMLPortal>
        <Probe />
      </EditorHTMLPortal>
    </EditorI18nProvider>
  );
  const container = detached[0]!.container;
  const input = container.querySelector("input")!;
  input.focus();
  input.value = "Heb ei gadw";
  await act(async () => {
    await instance.setLocale("nl");
    await instance.setProfile("plain");
  });
  expect(container.querySelector("label")?.textContent).toBe("Pagina toevoegen");
  expect(seen.mock.calls.every(([value]) => value === instance)).toBe(true);
  expect(container.querySelector("input")).toBe(input);
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("Heb ei gadw");
});
it("preserves an inherited controlled provider instead of replacing its callbacks", async () => {
  const instance = runtime();
  const onLocaleChange = vi.fn();
  const container = await mount(
    <EditorI18nProvider instance={instance} locale="en-GB" onLocaleChange={onLocaleChange}>
      <EditorI18nBoundary instance={instance}>
        <Controls />
      </EditorI18nBoundary>
    </EditorI18nProvider>
  );
  await act(async () => container.querySelector("button")!.click());
  expect(onLocaleChange).toHaveBeenCalledWith("nl");
  expect(instance.getSnapshot().locale).toBe("en-GB");
});
it("rehydrates the actual bridged instance after crossing the canvas renderer", async () => {
  const instance = runtime();
  await instance.setLocale("nl");
  const container = await mount(
    <EditorI18nBridgeContext.Provider value={instance}>
      <EditorI18nBoundary>
        <Controls />
      </EditorI18nBoundary>
    </EditorI18nBridgeContext.Provider>
  );
  expect(container.querySelector("label")?.textContent).toBe("Canvas toevoegen");
});

it("subscribes to the bridged runtime in a native scene without rendering a provider DOM element", async () => {
  const instance = runtime();
  const seen = vi.fn();
  function NativeControls() {
    const runtime = useEditorsI18nInstance();
    const t = useEditorsTranslations("editors");
    const display = useDisplayLabel();
    seen(runtime);
    return (
      <span>
        {t("canvas.add")} ·{" "}
        {display({ label: "Label", labelMessage: { namespace: "editor-api", key: "fields.label" } })}
      </span>
    );
  }
  const container = await mount(
    <EditorI18nBridgeContext.Provider value={instance}>
      <NativeControls />
    </EditorI18nBridgeContext.Provider>
  );
  expect(container.querySelector("[data-editor-i18n]")).toBeNull();
  await act(async () => {
    await instance.setLocale("nl");
    await instance.setProfile("plain");
  });
  expect(container.textContent).toBe("Pagina toevoegen · Titel");
  expect(seen.mock.calls.every(([value]) => value === instance)).toBe(true);
});
