import { act, useEffect, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { Vault } from "@iiif/helpers";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { useBrowserStoreContext, useOutputStore, useOmnisearchStore } from "iiif-browser";
import { CreateWebPageForm, createWebPage } from "../src/ContentResource/WebPageCreator/create-web-page";
import { CreatePlaintextForm } from "../src/ContentResource/PlaintextCreator/create-plaintext";
import { CreateThumbnailForm } from "../src/ContentResource/ThumbnailCreator/create-thumbnail";
import { CreateImageServerForm } from "../src/ContentResource/ImageServiceCreator/create-image-service";
import { CreateImageUrlListForm } from "../src/ContentResource/ImageUrlListCreator/create-image-url-list";
import {
  CreateVttAnnotationPageForm,
  createVttAnnotationPage,
} from "../src/AnnotationPage/VttAnnotationPage/create-vtt-annotation-page";
import { RangeWithItemsCreatorForm } from "../src/Range/RangeWithItems/create-range-with-items";
import { internalCanvas } from "../src/Canvas/InternalCanvas";
import ManifestBrowserForm from "../src/Manifest/ManifestBrowserCreator/manifest-browser-form.lazy";
import IIIFBrowserForm from "../src/ContentResource/IIIFBrowserCreator/iiif-browser-form.lazy";
import { creatorValidationError } from "../src/validation-messages";
import { allCreators, manifestBrowserCreator } from "../src/index";
import { useDecayState } from "../../shell/src/hooks/use-decay-state";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";

const fixture = vi.hoisted(() => ({ vault: undefined as Vault | undefined, plugins: [] as any[] }));
vi.mock("@manifest-editor/shell", () => ({
  useConfig: () => ({ i18n: { defaultLanguage: "cy", availableLanguages: ["cy", "en"], advancedLanguageMode: true } }),
  useDecayState: (time: number) => useDecayState(time),
  useNotebookBrowserPlugins: () => fixture.plugins,
  usePreviewVault: () => fixture.vault,
  PreviewVaultBoundary: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("react-iiif-vault", async (original) => ({
  ...(await original<typeof import("react-iiif-vault")>()),
  useManifest: () => fixture.vault?.get({ id: "https://example.org/m", type: "Manifest" }),
  useVault: () => fixture.vault,
  useClosestLanguage: () => "cy",
}));
const runtime = () =>
  createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });
const mounted: Array<{ root: Root; container: HTMLDivElement }> = [];
async function mount(child: ReactNode, i18n = runtime()) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={i18n}>
        <ThemeProvider theme={{ padding: {}, color: {}, sizes: {} }}>{child}</ThemeProvider>
      </EditorI18nProvider>
    )
  );
  return { container, i18n };
}
function context(initialData = {}, targetType = "ContentResource") {
  return { options: { initialData, targetType }, config: {}, runCreate: vi.fn() } as unknown as CreatorContext<any>;
}
function button(container: Element, text: string) {
  const el = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (x) => x.textContent === text || x.getAttribute("aria-label") === text
  );
  expect(el, text).toBeTruthy();
  return el!;
}
async function submit(container: Element) {
  await act(async () =>
    container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
}
function inputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  fixture.vault = new Vault();
  fixture.plugins = [];
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  Element.prototype.scrollIntoView = vi.fn();
  if (!globalThis.CSS) Object.assign(globalThis, { CSS: {} });
  CSS.escape ??= (value) => value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
});
afterEach(async () => {
  for (const { root, container } of mounted.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("resolves every shipped definition and configuration reference in real Dutch and plain wording", async () => {
  const i18n = runtime();
  await i18n.setLocale("nl");
  for (const creator of [...allCreators, manifestBrowserCreator]) {
    for (const prop of ["label", "summary"] as const) {
      const ref = creator[`${prop}Message`];
      expect(ref, `${creator.id}.${prop}`).toBeTruthy();
      expect(i18n.resolveMessage(ref)).not.toBe(ref?.key);
    }
    for (const field of creator.configuration?.fields ?? []) {
      expect(i18n.resolveMessage(field.labelMessage)).toBe(
        "Metadata van het manifest aan geïmporteerde canvassen toevoegen"
      );
    }
  }
  const blank = allCreators.find((c) => c.id === "@manifest-editor/empty-canvas")!;
  expect(i18n.resolveMessage(blank.labelMessage)).toBe("Leeg canvas");
  await i18n.setProfile("plain");
  expect(i18n.resolveMessage(blank.labelMessage)).toBe("Lege pagina");
});

it.each([
  ["web page", CreateWebPageForm],
  ["plain text", CreatePlaintextForm],
] as const)(
  "keeps real language-field drafts, DOM and authored maps through locale/profile changes (%s)",
  async (_name, Form) => {
    const authored = { cy: ["Teitl Cymraeg"], fr: ["Titre français"] };
    const props = context({ label: authored, url: "https://example.org/authored" });
    const { container, i18n } = await mount(<Form {...props} />);
    const url = container.querySelector<HTMLInputElement>('[name="url"]')!;
    await act(async () => inputValue(url, "https://example.org/draft"));
    const fields = [...container.querySelectorAll("textarea,input")];
    await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
    expect(container.querySelector('[name="url"]')).toBe(url);
    expect(url.value).toBe("https://example.org/draft");
    expect([...container.querySelectorAll("textarea,input")]).toEqual(fields);
    expect(container.textContent).toContain("Titel");
    await submit(container);
    expect(props.runCreate).toHaveBeenCalledWith({ url: "https://example.org/draft", label: authored });
    const embed = vi.fn((x) => x);
    const resource = await createWebPage({ url: "https://example.org/draft", label: authored }, { embed } as any);
    expect(resource).toEqual({ id: "https://example.org/draft", type: "Text", label: authored, format: "text/html" });
    expect((resource as any).label).toBe(authored);
  }
);

it("retains multiple-image drafts and accessible textarea labels while using unchanged callback URLs", async () => {
  const props = context();
  const { container, i18n } = await mount(<CreateImageUrlListForm {...props} />);
  const text = container.querySelector("textarea")!;
  await act(async () => inputValue(text, "https://example.org/a.jpg\nhttps://example.org/b.jpg"));
  await act(async () => i18n.setLocale("nl"));
  expect(container.querySelector("textarea")).toBe(text);
  expect(text.getAttribute("aria-label")).toBe("Voer een lijst met URL’s in (één per regel)");
  await submit(container);
  expect(props.runCreate).toHaveBeenCalledWith({
    images: [{ url: "https://example.org/a.jpg" }, { url: "https://example.org/b.jpg" }],
  });
});

it("retains a WebVTT language code and label while translating help, validation and names", async () => {
  const authored = { cy: ["Isdeitlau"] };
  const props = context({ label: authored, url: "https://example.org/captions.vtt", language: "cy" });
  const { container, i18n } = await mount(<CreateVttAnnotationPageForm {...props} />);
  const language = container.querySelector<HTMLInputElement>('[name="language"]')!;
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(container.querySelector('[name="language"]')).toBe(language);
  expect(language.value).toBe("cy");
  expect(container.querySelector('[name="url"]')?.getAttribute("title")).toContain("volledige URL");
  expect(container.textContent).toContain("deze pagina");
  await submit(container);
  expect(props.runCreate).toHaveBeenCalledWith({
    url: "https://example.org/captions.vtt",
    label: authored,
    language: "cy",
  });
  const ctx = {
    embed: (x: unknown) => x,
    generateId: (kind: string) => `urn:${kind}`,
    getParent: () => ({ id: "urn:canvas", type: "Canvas" }),
  } as unknown as CreatorFunctionContext;
  const resource: any = await createVttAnnotationPage(
    { url: "https://example.org/captions.vtt", language: "cy", label: authored },
    ctx
  );
  expect(resource.items[0].body).toEqual({
    id: "https://example.org/captions.vtt",
    type: "Text",
    format: "text/vtt",
    language: "cy",
    label: authored,
  });
  let failure: unknown;
  try {
    await createVttAnnotationPage({ url: "bad" }, ctx);
  } catch (e) {
    failure = e;
  }
  const feedback = creatorValidationError(failure)!;
  expect(i18n.resolveMessage(feedback.message)).toContain("WebVTT-bestand");
  expect(creatorValidationError(new Error("foreign failure"))).toBeUndefined();
});

it("keeps range payload IDs and labels while switching plain terminology", async () => {
  const props = context({ label: { cy: ["Adran"] }, items: [{ id: "urn:canvas", type: "Canvas" }] });
  const { container, i18n } = await mount(<RangeWithItemsCreatorForm {...props} />);
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  expect(button(container, "Sectie aanmaken")).toBeTruthy();
  await submit(container);
  expect(props.runCreate).toHaveBeenCalledWith({
    type: "Range",
    label: { cy: ["Adran"] },
    items: [{ id: "urn:canvas", type: "Canvas" }],
  });
});

it.each(["thumbnail", "service"])(
  "preserves %s request and draft across locale changes, and translates retained failures",
  async (kind) => {
    let resolve!: (r: any) => void;
    const fetcher = vi.fn(() => new Promise((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetcher);
    const props = context({ url: "https://example.org/image/info.json" });
    const Form = kind === "thumbnail" ? CreateThumbnailForm : CreateImageServerForm;
    const { container, i18n } = await mount(<Form {...props} />);
    const url = container.querySelector<HTMLInputElement>('[name="url"]')!;
    await submit(container);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => i18n.setLocale("nl"));
    expect(container.querySelector('[name="url"]')).toBe(url);
    expect(container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
    expect(container.textContent).toContain("Laden");
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ ok: false }));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("De afbeeldingsdienst");
    await act(async () => i18n.setLocale("en-GB"));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Could not load");
    expect(url.value).toBe("https://example.org/image/info.json");
    expect(props.runCreate).not.toHaveBeenCalled();
  }
);

it("finishes an in-flight thumbnail request in Dutch, keeps selected numeric size and service payload", async () => {
  let resolve!: (r: any) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise((r) => (resolve = r)))
  );
  const props = context({ url: "https://example.org/image/info.json" });
  const { container, i18n } = await mount(<CreateThumbnailForm {...props} />);
  await submit(container);
  await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
  const service = {
    id: "https://example.org/image",
    type: "ImageService3",
    profile: "level1",
    width: 4000,
    height: 2000,
    sizes: [
      { width: 1000, height: 500 },
      { width: 2000, height: 1000 },
    ],
  };
  await act(async () => resolve({ ok: true, json: async () => service }));
  await act(async () => button(container, "2.000 × 1.000 pixels").click());
  const image = container.querySelector("img")!;
  const src = image.src;
  expect(image.alt).toBe("Voorbeeld van geselecteerde resource");
  await act(async () => i18n.setLocale("en-GB"));
  expect(container.querySelector("img")).toBe(image);
  expect(image.src).toBe(src);
  await act(async () => button(container, "Add thumbnail").click());
  expect(props.runCreate).toHaveBeenCalledWith({ service, width: 2000, height: 1000, thumbnailUrl: src });
});

it.each(["internal", "manifest", "content"])(
  "keeps real %s browser history, search draft, selection and callback identifiers across live translation",
  async (kind) => {
    const vault = fixture.vault!;
    await vault.loadManifest("https://example.org/m", {
      id: "https://example.org/m",
      type: "Manifest",
      label: { cy: ["Teitl Cymraeg"] },
      items: [
        { id: "https://example.org/c", type: "Canvas", label: { cy: ["Tudalen"] }, width: 10, height: 10, items: [] },
      ],
    });
    const before = JSON.stringify(vault.getState());
    let browser!: ReturnType<typeof useBrowserStoreContext>;
    let output!: ReturnType<typeof useOutputStore>;
    let search!: ReturnType<typeof useOmnisearchStore>;
    function Probe() {
      const b = useBrowserStoreContext();
      const o = useOutputStore();
      const s = useOmnisearchStore();
      useEffect(() => {
        browser = b;
        output = o;
        search = s;
      }, [b, o, s]);
      return null;
    }
    fixture.plugins = [{ id: "creator-probe", header: <Probe /> }];
    const props = context({ url: "https://example.org/m" }, kind === "content" ? "Canvas" : "Manifest");
    const node =
      kind === "internal" ? (
        internalCanvas.render!(props)
      ) : kind === "manifest" ? (
        <ManifestBrowserForm {...props} />
      ) : (
        <IIIFBrowserForm {...props} />
      );
    const { container, i18n } = await mount(node);
    const id = kind === "manifest" ? "https://example.org/m" : "https://example.org/c";
    const type = kind === "manifest" ? "Manifest" : "Canvas";
    await act(async () => {
      browser.getState().resolve("https://example.org/m");
      output.getState().replaceSelectedItems([{ id, type }]);
      search.getState().open("draft query");
    });
    const history = browser.getState().history;
    const location = history.location;
    const selected = output.getState().selectedItems;
    const input = [...document.querySelectorAll<HTMLInputElement>("input")].find((el) => el.value === "draft query")!;
    expect(input?.value).toBe("draft query");
    await act(async () => i18n.select({ locale: "nl", profile: "plain" }));
    expect(browser.getState().history).toBe(history);
    expect(history.location).toBe(location);
    expect(output.getState().selectedItems).toBe(selected);
    expect(document.contains(input)).toBe(true);
    expect(input.value).toBe("draft query");
    await act(async () => search.getState().close());
    const label = kind === "internal" ? "Pagina selecteren" : kind === "manifest" ? "Selecteren" : "Aan item toevoegen";
    await act(async () => button(container, label).click());
    if (kind === "internal") expect(props.runCreate).toHaveBeenCalledWith({ id });
    else expect((props.runCreate as any).mock.calls[0][0].output[0].resource.id).toBe(id);
    expect(JSON.stringify(vault.getState())).toBe(before);
    expect(container.querySelector('[aria-label="Terug"]')).toBeTruthy();
  }
);

it.each(["manifest", "content"])(
  "resolves a caller-owned %s action reference live without recreating its browser",
  async (kind) => {
    const vault = fixture.vault!;
    await vault.loadManifest("https://example.org/m", {
      id: "https://example.org/m",
      type: "Manifest",
      label: { cy: ["Teitl"] },
      items: [],
    });
    let output!: ReturnType<typeof useOutputStore>;
    function Probe() {
      const store = useOutputStore();
      useEffect(() => {
        output = store;
      }, [store]);
      return null;
    }
    fixture.plugins = [{ id: "caller-probe", header: <Probe /> }];
    const props = context({
      url: "https://example.org/m",
      actionLabelMessage: { namespace: "common", key: "actions.add" },
    });
    const Form = kind === "manifest" ? ManifestBrowserForm : IIIFBrowserForm;
    const { container, i18n } = await mount(<Form {...props} />);
    const id = kind === "manifest" ? "https://example.org/m" : "https://example.org/image";
    const type = kind === "manifest" ? "Manifest" : "ImageService";
    if (kind === "content")
      await vault.load(id, { id, type: "ImageService3", profile: "level1", width: 10, height: 10 });
    await act(async () => output.getState().replaceSelectedItems([{ id, type }]));
    const before = output.getState().selectedItems;
    expect(button(container, "Add")).toBeTruthy();
    await act(async () => i18n.setLocale("nl"));
    expect(button(container, "Toevoegen")).toBeTruthy();
    expect(output.getState().selectedItems).toBe(before);
  }
);
