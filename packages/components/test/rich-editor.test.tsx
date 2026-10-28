import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { dutchCatalogs } from "@manifest-editor/i18n/nl";
import { MDXEditor } from "../src/MDXEditor";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
it("translates the real rich-text toolbar in place without emitting or replacing authored content", async () => {
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
  const i18n = createEditorI18n({ locales: [...defaultLocales, dutchLocale], catalogs: dutchCatalogs });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<MDXEditorMethods>();
  const change = vi.fn();
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={i18n}>
          <MDXEditor editorRef={ref} markdown="Teitl Cymraeg" onChange={change} />
        </EditorI18nProvider>
      )
    );
    expect(container.querySelector('[aria-label="Bold"]')).not.toBeNull();
    const editable = container.querySelector('[contenteditable="true"]');
    await act(async () => ref.current!.setMarkdown("Testun heb ei gadw"));
    const callsBeforeLocale = change.mock.calls.length;
    await act(async () => {
      await i18n.setLocale("nl");
    });
    expect(container.querySelector('[aria-label="Vet"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="IIIF-afbeelding invoegen"]')).not.toBeNull();
    expect(container.querySelector('[contenteditable="true"]')).toBe(editable);
    expect(ref.current!.getMarkdown()).toBe("Testun heb ei gadw");
    expect(change.mock.calls.length).toBe(callsBeforeLocale);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
