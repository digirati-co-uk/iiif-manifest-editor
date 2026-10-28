import { createRequire } from "node:module";
import * as browserESM from "iiif-browser";
import { act, createRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import { Vault } from "@iiif/helpers";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { useBrowserStoreContext, useOutputStore, type IIIFBrowserProps } from "iiif-browser";
import { diffSourcePlugin, type MDXEditorMethods } from "@mdxeditor/editor";
import { EditorView } from "@codemirror/view";
import { openSearchPanel, getSearchQuery, setSearchQuery, SearchQuery } from "@codemirror/search";
import { undo } from "@codemirror/commands";
import { useIIIFBrowserI18n } from "../src/IIIFBrowserI18n";
import { MDXEditor } from "../src/MDXEditor";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
beforeEach(() => {
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
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
});
const runtime = () =>
  createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });

it.each(["esm", "cjs"])(
  "keeps the real %s browser history, selected IDs, caller labels and Vault content across live locale switches",
  async (distribution) => {
    const library =
      distribution === "esm" ? browserESM : (createRequire(import.meta.url)("iiif-browser") as typeof browserESM);
    const i18n = runtime();
    const vault = new Vault();
    await vault.loadManifest("https://example.org/m", {
      id: "https://example.org/m",
      type: "Manifest",
      label: { cy: ["Teitl Cymraeg"] },
      items: [],
    });
    const before = JSON.stringify(vault.getState());
    let browser: ReturnType<typeof useBrowserStoreContext>;
    let output: ReturnType<typeof useOutputStore>;
    let searchStore: ReturnType<typeof browserESM.useOmnisearchStore>;
    function Probe() {
      const store = library.useBrowserStoreContext();
      const outputs = library.useOutputStore();
      const search = library.useOmnisearchStore();
      useEffect(() => {
        browser = store;
        output = outputs;
        searchStore = search;
      }, [store, outputs, search]);
      return null;
    }
    const selected = vi.fn();
    const props: IIIFBrowserProps = {
      vault,
      history: {
        saveToLocalStorage: false,
        restoreFromLocalStorage: true,
        localStorageKey: "dependency-i18n-test",
        initialHistory: [
          { route: "/", url: "iiif://home", resource: null },
          {
            route: "/manifest",
            url: "https://example.org/m",
            resource: "https://example.org/m",
            metadata: { type: "Manifest", label: { cy: ["Teitl Cymraeg"] } },
            timestamp: new Date().toISOString(),
          },
        ],
      },
      plugins: [{ id: "test-probe", header: <Probe /> }],
      output: [
        {
          label: "Caller Select Cymraeg",
          type: "callback",
          format: { type: "url" },
          supportedTypes: ["Manifest"],
          cb: selected,
        },
      ],
    };
    function Browser() {
      const inputs = useIIIFBrowserI18n();
      return <library.IIIFBrowser {...props} i18n={inputs} />;
    }
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () =>
        root.render(
          <EditorI18nProvider instance={i18n}>
            <Browser />
            <aside data-english-fallback>
              <library.IIIFBrowser history={{ saveToLocalStorage: false, restoreFromLocalStorage: false }} />
            </aside>
          </EditorI18nProvider>
        )
      );
      expect(container.querySelector('[aria-label="Go Back"]')).not.toBeNull();
      expect(container.textContent).toContain("Recent Manifests");
      await act(async () => {
        browser!.getState().resolve("https://example.org/m");
        output!.getState().replaceSelectedItems([{ id: "https://example.org/m", type: "Manifest" }]);
      });
      const history = browser!.getState().history;
      const location = history.location;
      const selection = output!.getState().selectedItems;
      expect(container.textContent).toContain("Teitl Cymraeg");
      await act(async () => i18n.setLocale("nl"));
      expect(container.querySelector('[aria-label="Terug"]')).not.toBeNull();
      expect(container.querySelector('aside [aria-label="Go Back"]')).not.toBeNull();
      expect(container.querySelector('[aria-label="Caller Select Cymraeg"]')).not.toBeNull();
      expect(browser!.getState().history).toBe(history);
      expect(history.location).toBe(location);
      expect(output!.getState().selectedItems).toBe(selection);
      expect(JSON.stringify(vault.getState())).toBe(before);
      await act(async () =>
        (container.querySelector('[aria-label="Caller Select Cymraeg"]') as HTMLButtonElement).click()
      );
      expect(selected).toHaveBeenCalledWith("https://example.org/m");
      await act(async () => browser!.getState().resolve("iiif://history"));
      expect(container.textContent).toContain("Geschiedenis");
      expect(container.textContent).toContain("1 vermelding");
      expect(container.textContent).toContain("Teitl Cymraeg");
      expect(container.textContent).not.toMatch(/ago|minute|hour/);
      await act(async () => searchStore!.getState().open("Geschiedenis"));
      expect(searchStore!.getState().results?.some((item) => item.id === "iiif://history")).toBe(true);
      const searchInput = container.querySelector("input")!;
      expect(searchInput.value).toBe("Geschiedenis");
      await act(async () => i18n.setLocale("en-GB"));
      expect(container.querySelector("input")).toBe(searchInput);
      expect(searchInput.value).toBe("Geschiedenis");
      expect(container.textContent).toContain("No results found");
      expect(container.textContent).toContain("1 item");
      await act(async () => {
        searchStore!.getState().close();
        browser!.getState().resolve("https://example.org/m");
        await vault.loadManifest("https://example.org/m2", {
          id: "https://example.org/m2",
          type: "Manifest",
          label: { cy: ["Ail deitl"] },
          items: [],
        });
        output!.getState().replaceSelectedItems([
          { id: "https://example.org/m", type: "Manifest" },
          { id: "https://example.org/m2", type: "Manifest" },
        ]);
      });
      expect(container.textContent).toContain("2 items selected");
      const multiple = output!.getState().selectedItems;
      await act(async () => i18n.setLocale("nl"));
      expect(container.textContent).toContain("2 items geselecteerd");
      expect(output!.getState().selectedItems).toBe(multiple);
      await act(async () => output!.getState().replaceSelectedItems([]));
      expect(container.querySelector('[aria-label="Meerdere items geselecteerd"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  },
  20000
);

it.each(["source", "diff"] as const)(
  "reconfigures real CodeMirror %s phrases without replacing the document, selection, query or undo history",
  async (viewMode) => {
    const i18n = runtime();
    const ref = createRef<MDXEditorMethods>();
    const changed = vi.fn();
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const plugins = [diffSourcePlugin({ viewMode, diffMarkdown: "Fersiwn wreiddiol", readOnlyDiff: false })];
    try {
      await act(async () =>
        root.render(
          <EditorI18nProvider instance={i18n}>
            <MDXEditor editorRef={ref} markdown="Teitl Cymraeg" plugins={plugins} onChange={changed} />
          </EditorI18nProvider>
        )
      );
      const editors = container.querySelectorAll<HTMLElement>(".cm-editor");
      const editor = editors[editors.length - 1]!;
      const view = EditorView.findFromDOM(editor)!;
      await act(async () => {
        view.dispatch({
          changes: { from: view.state.doc.length, insert: " heb ei gadw" },
          selection: { anchor: 0, head: 5 },
        });
        openSearchPanel(view);
        view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "Cymraeg", replace: "Newydd" })) });
      });
      expect(container.querySelector('[aria-label="Find"]')).not.toBeNull();
      const find = container.querySelector<HTMLInputElement>('[aria-label="Find"]')!;
      expect(find.value).toBe("Cymraeg");
      find.focus();
      find.setSelectionRange(2, 5);
      const doc = view.state.doc;
      const selection = view.state.selection;
      const query = getSearchQuery(view.state);
      const callbacks = changed.mock.calls.length;
      await act(async () => i18n.setLocale("nl"));
      expect(container.contains(editor)).toBe(true);
      expect(EditorView.findFromDOM(editor)).toBe(view);
      expect(container.querySelector('[aria-label="Zoeken"]')).not.toBeNull();
      expect(container.querySelector('[aria-label="Vervangen"]')).not.toBeNull();
      const localizedFind = container.querySelector<HTMLInputElement>('[aria-label="Zoeken"]')!;
      expect(document.activeElement).toBe(localizedFind);
      expect([localizedFind.selectionStart, localizedFind.selectionEnd]).toEqual([2, 5]);
      expect(container.textContent).toContain("hoofdlettergevoelig");
      expect(view.state.doc).toBe(doc);
      expect(view.state.selection.eq(selection)).toBe(true);
      expect(getSearchQuery(view.state).eq(query)).toBe(true);
      expect(changed.mock.calls.length).toBe(callbacks);
      expect(ref.current!.getMarkdown()).toContain("heb ei gadw");
      await act(async () => {
        expect(undo(view)).toBe(true);
      });
      expect(view.state.doc.toString()).toBe("Teitl Cymraeg");
      await act(async () => i18n.setLocale("en-GB"));
      expect(container.querySelector('[aria-label="Find"]')).not.toBeNull();
      expect(view.state.doc.toString()).toBe("Teitl Cymraeg");
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  }
);

it("translates actual IIIF image options in an open MDX dialog without resetting its draft or output URL", async () => {
  const i18n = runtime();
  const ref = createRef<MDXEditorMethods>();
  const url = "https://images.example.org/image";
  const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          "@context": "http://iiif.io/api/image/3/context.json",
          id: url,
          type: "ImageService3",
          protocol: "http://iiif.io/api/image",
          profile: "level2",
          width: 2400,
          height: 1800,
          extraQualities: ["color", "gray"],
          extraFormats: ["png"],
          label: { cy: ["Llun Cymraeg"] },
        }),
        { headers: { "content-type": "application/json" } }
      )
  );
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={i18n}>
          <MDXEditor editorRef={ref} markdown="Testun Cymraeg" />
        </EditorI18nProvider>
      )
    );
    await act(async () => (container.querySelector('[aria-label="Insert IIIF image"]') as HTMLButtonElement).click());
    const click = async (label: string) =>
      act(async () => (document.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement).click());
    await click("Edit URL and show search");
    const input = document.querySelector(
      '[aria-label="Search commands or enter a URL to a IIIF Manifest or Collection"]'
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, url);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 40));
    });
    await click("Select image");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    const preview = document.querySelector('[aria-label="Image preview"]')!;
    expect(preview).not.toBeNull();
    expect(document.body.textContent).toContain("Request size");
    const alt = Array.from(document.querySelectorAll("label"))
      .find((label) => label.textContent?.includes("Alternative text"))!
      .querySelector("input")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(alt, "Disgrifiad heb ei gadw");
      alt.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
    });
    const quality = Array.from(document.querySelectorAll("label"))
      .find((label) => label.textContent?.includes("Quality"))!
      .querySelector("select")!;
    await act(async () => {
      quality.value = "gray";
      quality.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const source = preview.querySelector("img")!.getAttribute("src");
    expect(source).toContain("gray.jpg");
    const markdown = ref.current!.getMarkdown();
    await act(async () => i18n.setLocale("nl"));
    expect(document.querySelector('[aria-label="Afbeeldingsvoorbeeld"]')).toBe(preview);
    expect(preview.querySelector("img")!.getAttribute("src")).toBe(source);
    expect(document.body.textContent).toContain("Aangevraagde grootte");
    expect(document.body.textContent).toContain("Maximaal (2.400 × 1.800)");
    expect(document.body.textContent).toContain("Kwaliteit");
    expect(quality.value).toBe("gray");
    expect(quality.selectedOptions[0]?.textContent).toBe("grijstinten");
    expect(alt.value).toBe("Disgrifiad heb ei gadw");
    expect(ref.current!.getMarkdown()).toBe(markdown);
    const insert = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Afbeelding invoegen"
    )!;
    expect(insert).toBeDefined();
    await act(async () => insert.click());
    expect(ref.current!.getMarkdown()).toContain("Disgrifiad heb ei gadw");
    expect(ref.current!.getMarkdown()).toContain(source);
  } finally {
    fetch.mockRestore();
    await act(async () => root.unmount());
    container.remove();
  }
});

it("reindexes browser command wording without resetting the query or history", async () => {
  const i18n = createEditorI18n({
    profiles: { plain: { "en-GB": { components: { browser: { history: "Activity log" } } } } },
  });
  let search!: ReturnType<typeof browserESM.useOmnisearchStore>;
  let browser!: ReturnType<typeof useBrowserStoreContext>;
  function Probe() {
    search = browserESM.useOmnisearchStore();
    browser = useBrowserStoreContext();
    return null;
  }
  const plugins = [{ id: "wording-probe", header: <Probe /> }];
  function Browser() {
    const i18n = useIIIFBrowserI18n();
    return (
      <browserESM.IIIFBrowser
        i18n={i18n}
        plugins={plugins}
        history={{ saveToLocalStorage: false, restoreFromLocalStorage: false }}
      />
    );
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={i18n}>
          <Browser />
        </EditorI18nProvider>
      )
    );
    await act(async () => search.getState().open("Activity"));
    expect(search.getState().results?.some((item) => item.id === "iiif://history")).toBe(false);
    const input = container.querySelector("input")!;
    const history = browser.getState().history;
    await act(async () => i18n.setProfile("plain"));
    expect(container.querySelector("input")).toBe(input);
    expect(input.value).toBe("Activity");
    expect(browser.getState().history).toBe(history);
    expect(search.getState().results?.some((item) => item.id === "iiif://history")).toBe(true);
    await act(async () => i18n.setProfile("standard"));
    expect(search.getState().results?.some((item) => item.id === "iiif://history")).toBe(false);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
