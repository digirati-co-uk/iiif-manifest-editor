import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { EditorI18nProvider, useEditorI18n } from "@manifest-editor/i18n";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { Editor } from "@tiptap/core";
import { TiptapRichTextLanguageField } from "../src/components/TiptapLanguageFieldEditor/TiptapRichTextLanguageField";
import { NavigationDateField } from "../src/components/NavigationDateField";
import { CanvasLayoutPicker } from "../src/components/CanvasLayout/CanvasLayoutPicker";
import { CanvasShapePicker } from "../src/components/CanvasLayout/CanvasImageMode";
import { ViewingDirectionEditor } from "../src/components/ViewingDirectionEditor/ViewingDirectionEditor";
import { LanguageFieldEditor } from "../src/components/LanguageFieldEditor/LanguageFieldEditor";
import { useDecayState as actualDecayState } from "../../shell/src/hooks/use-decay-state";
import { EditorInstance } from "@manifest-editor/editor-api";
import { Vault } from "@iiif/helpers/vault";
import { TechnicalProperties } from "../src/definitions/TechnicalProperties/TechnicalProperties";
import { contentLanguageName } from "../src/i18n";

const shell = vi.hoisted(() => ({
  resource: { id: "urn:canvas", type: "Canvas", viewingDirection: "right-to-left" },
  modify: vi.fn(),
  editor: undefined as EditorInstance<any> | undefined,
}));
vi.mock("@manifest-editor/shell", () => ({
  useResource: () => shell.resource,
  useEditor: () => shell.editor,
  useConfig: () => ({ i18n: { defaultLanguage: "cy", availableLanguages: ["cy", "en"], advancedLanguageMode: true } }),
  useDecayState: (time: number) => actualDecayState(time),
}));
vi.mock("react-iiif-vault", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-iiif-vault")>()),
  useVault: () => ({ modifyEntityField: shell.modify }),
  useClosestLanguage: () => "cy",
}));

function runtime(locale = "en-GB") {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
    config: { defaultLocale: locale },
  });
}
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
  return container;
}
afterEach(async () => {
  for (const { root, container } of mounted.splice(0)) {
    await act(async () => root.unmount());
    container.remove();
  }
  vi.restoreAllMocks();
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
function button(container: Element, title: string) {
  const found = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (el) => el.title === title || el.textContent === title || el.getAttribute("aria-label") === title
  );
  expect(found, title).toBeTruthy();
  return found!;
}

it("retains a real ProseMirror instance, history, selection and authored Welsh HTML while changing locale/profile", async () => {
  // JSDOM does not implement layout rectangles used by ProseMirror's focused undo scrolling.
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }),
  });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", { configurable: true, value: () => new DOMRect() });
  const i18n = runtime();
  const onUpdate = vi.fn();
  const container = await mount(
    <TiptapRichTextLanguageField
      language="cy"
      value="<p><strong>Enw Cymraeg</strong></p>"
      onUpdate={onUpdate}
      languages={["cy", "en", "x-invalid_tag"]}
      onUpdateLanguage={vi.fn()}
    />,
    i18n
  );
  const element = container.querySelector<HTMLElement>(".tiptap")!;
  const editor = (element as HTMLElement & { editor: Editor }).editor;
  expect(editor).toBeTruthy();
  await act(async () => {
    editor.commands.setTextSelection(5);
    editor.commands.insertContent(" drafft");
    editor.commands.setTextSelection({ from: 2, to: 6 });
  });
  await act(async () => element.focus());
  const doc = editor.getJSON();
  const selection = editor.state.selection.toJSON();
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector(".tiptap")).toBe(element);
  expect(editor.getJSON()).toEqual(doc);
  expect(editor.state.selection.toJSON()).toEqual(selection);
  expect(document.activeElement).toBe(element);
  expect(button(container, "Vet").getAttribute("aria-label")).toBe("Vet");
  await act(async () => editor.commands.undo());
  expect(editor.getText()).toBe("Enw Cymraeg");
});

it("keeps a focused plain draft and Welsh content tag while updating language names and whole option labels", async () => {
  const i18n = runtime();
  const updateLanguage = vi.fn();
  const container = await mount(
    <TiptapRichTextLanguageField
      language="cy"
      value="Enw"
      disallowHTML
      onUpdate={vi.fn()}
      languages={["cy", "en", "bad_tag"]}
      onUpdateLanguage={updateLanguage}
    />,
    i18n
  );
  const input = container.querySelector("textarea")!;
  input.focus();
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(input, "Drafft heb ei gadw");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  input.setSelectionRange(3, 7);
  await act(async () => i18n.setLocale("nl"));
  expect(container.querySelector("textarea")).toBe(input);
  expect(input.value).toBe("Drafft heb ei gadw");
  expect(document.activeElement).toBe(input);
  expect(input.selectionStart).toBe(3);
  await act(async () => button(container, "Taal en opmaak").click());
  const select = container.querySelector("select")!;
  expect(select.value).toBe("cy");
  expect(select.textContent).toContain("Welsh");
  expect(select.textContent).toContain("bad_tag");
  expect(updateLanguage).not.toHaveBeenCalled();
});

it("localises the real calendar accessible names, validation and clear callback without rewriting its Date", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    measureText: (text: string) => ({ width: text.length * 8 }),
  } as unknown as CanvasRenderingContext2D);
  const i18n = runtime("nl");
  const onChange = vi.fn();
  const value = new Date("2024-02-29T13:45:00Z");
  function Field() {
    useEditorI18n();
    return <NavigationDateField id="nav-date" value={new Date(value.getTime())} onChange={onChange} />;
  }
  const container = await mount(<Field />, i18n);
  expect(container.querySelector('[aria-label="Dag navigatiedatum"]')).toBeTruthy();
  await act(async () => button(container, "Kalender voor navigatiedatum openen").click());
  expect(container.querySelector('[aria-label="Volgende maand"]')).toBeTruthy();
  expect(container.textContent).toContain("februari");
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => i18n.setLocale("en-GB"));
  expect(value.toISOString()).toBe("2024-02-29T13:45:00.000Z");
  expect(onChange).not.toHaveBeenCalled();
  const day = container.querySelector<HTMLInputElement>('[aria-label="Nav Date day"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(day, "99");
    day.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(container.querySelector('[role="alert"]')?.textContent).toBe("Enter a valid navigation date and time.");
  await act(async () => i18n.setLocale("nl"));
  expect(container.querySelector('[role="alert"]')?.textContent).toBe("Voer een geldige navigatiedatum en tijd in.");
  expect(container.querySelector('[aria-label="Dag navigatiedatum"]')).toBe(day);
  expect(day.value).toBe("99");
  await act(async () => button(container, "Navigatiedatum wissen").click());
  expect(onChange).toHaveBeenCalledWith(null);
});

it("resolves layout metadata and plurals in Dutch while callbacks retain geometry and IDs", async () => {
  const i18n = runtime("nl");
  const onChange = vi.fn();
  const shape = vi.fn();
  const container = await mount(
    <>
      <CanvasLayoutPicker imageCount={2} onChange={onChange} />
      <CanvasShapePicker aspectRatio={1} onChange={shape} />
    </>,
    i18n
  );
  expect(container.textContent).toContain("Indelingen voor 2 afbeeldingen.");
  const radio = container.querySelector<HTMLInputElement>('input[type="radio"]')!;
  await act(async () => radio.click());
  expect(onChange.mock.calls[0]![0].id).toBe(radio.value);
  expect(onChange.mock.calls[0]![0].slots).toHaveLength(2);
  await act(async () => button(container, "12 × 12 · Vierkant").click());
  expect(shape.mock.calls[0]![0]).toMatchObject({ columns: 12, rows: 12 });
});

it("keeps protocol viewing-direction values through translated control callbacks", async () => {
  const i18n = runtime("nl");
  shell.modify.mockClear();
  const container = await mount(<ViewingDirectionEditor id="direction" />, i18n);
  const control = [...container.querySelectorAll<HTMLElement>("[data-active]")].find(
    (el) => el.textContent === "Van links naar rechts"
  )!;
  await act(async () => control.click());
  expect(shell.modify).toHaveBeenCalledWith(shell.resource, "viewingDirection", "left-to-right");
  await act(async () => i18n.setProfile("plain"));
  expect(shell.modify).toHaveBeenCalledTimes(1);
});

it("keeps authored language-map fields and draft DOM across a wording-profile switch", async () => {
  const i18n = runtime();
  const onSave = vi.fn();
  const fields = { cy: ["Enw Cymraeg"], bad_tag: ["Authored"] };
  const container = await mount(
    <LanguageFieldEditor
      label="Label"
      labelMessage={{ namespace: "editor-api", key: "fields.label" }}
      focusId="label-field"
      fields={fields}
      onSave={onSave}
    />,
    i18n
  );
  const textarea = container.querySelector("textarea")!;
  textarea.focus();
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector("textarea")).toBe(textarea);
  expect(container.querySelector("label")?.textContent).toBe("Titel");
  expect(fields).toEqual({ cy: ["Enw Cymraeg"], bad_tag: ["Authored"] });
  expect(onSave).not.toHaveBeenCalled();
  expect(contentLanguageName("cy", "nl", "Geen taal")).toBe("Welsh");
  expect(contentLanguageName("bad_tag", "nl", "Geen taal")).toBe("bad_tag");
});

it("translates the destructive-formatting confirmation and preserves rich content when cancelled", async () => {
  const i18n = runtime("nl");
  const onUpdate = vi.fn();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const container = await mount(
    <TiptapRichTextLanguageField language="cy" value="<p><strong>Cymraeg</strong></p>" onUpdate={onUpdate} />,
    i18n
  );
  await act(async () => button(container, "Taal en opmaak").click());
  await act(async () => button(container, "Tekst").click());
  expect(confirm).toHaveBeenCalledWith(
    "Door over te schakelen naar platte tekst wordt opmaak zoals vet, koppelingen en koppen verwijderd. Doorgaan?"
  );
  expect(container.querySelector(".tiptap strong")?.textContent).toBe("Cymraeg");
  expect(onUpdate).not.toHaveBeenCalled();
});

it("preserves an incomplete focused HTML source draft through a locale/profile switch", async () => {
  const i18n = runtime();
  const onUpdate = vi.fn();
  const container = await mount(
    <TiptapRichTextLanguageField language="cy" value="<p><strong>Cymraeg</strong></p>" onUpdate={onUpdate} />,
    i18n
  );
  await act(async () => button(container, "Edit HTML source").click());
  const input = container.querySelector("textarea")!;
  await act(async () => {
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
      input,
      '<p><strong>Drafft <a href="'
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  input.setSelectionRange(4, 9);
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector("textarea")).toBe(input);
  expect(input.value).toBe('<p><strong>Drafft <a href="');
  expect(document.activeElement).toBe(input);
  expect(input.selectionStart).toBe(4);
  expect(onUpdate).not.toHaveBeenCalled();
  expect(button(container, "Terug naar opgemaakte weergave")).toBeTruthy();
});

it("edits technical MIME and dimensions through the actual editor API under Dutch and plain wording", async () => {
  const vault = new Vault();
  vault.loadManifestSync("urn:manifest", {
    id: "urn:manifest",
    type: "Manifest",
    label: { cy: ["Maniffest"] },
    items: [
      {
        id: "urn:canvas",
        type: "Canvas",
        width: 100,
        height: 200,
        items: [
          {
            id: "urn:page",
            type: "AnnotationPage",
            items: [
              {
                id: "urn:annotation",
                type: "Annotation",
                motivation: "painting",
                target: "urn:canvas",
                body: {
                  id: "urn:image",
                  type: "Image",
                  format: "image/jpeg",
                  width: 100,
                  height: 200,
                  label: { cy: ["Delwedd"] },
                },
              },
            ],
          },
        ],
      },
    ],
  });
  shell.editor = new EditorInstance({ vault, reference: { id: "urn:image", type: "ContentResource" } });
  const i18n = runtime("nl");
  const container = await mount(<TechnicalProperties />, i18n);
  const format = container.querySelector<HTMLInputElement>('input[placeholder="jpg, png enz."]')!;
  const width = container.querySelector<HTMLInputElement>("#dims-width")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(format, "image/avif");
    format.dispatchEvent(new Event("input", { bubbles: true }));
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(width, "321");
    width.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(shell.editor.technical.format.get()).toBe("image/avif");
  expect(shell.editor.technical.width.get()).toBe(321);
  const before = JSON.stringify(vault.getState().iiif);
  await act(async () => {
    await i18n.setLocale("en-GB");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector("#dims-width")).toBe(width);
  expect(JSON.stringify(vault.getState().iiif)).toBe(before);
});

it("provides Dutch instructions and role descriptions in the real sortable list", async () => {
  const i18n = runtime("nl");
  const { ReorderList } = await import("../src/components/ReorderList/ReorderList.dndkit");
  const container = await mount(
    <ReorderList
      id="items"
      items={[{ id: "urn:a" }, { id: "urn:b" }]}
      reorder={vi.fn()}
      renderItem={(item) => <span>{item.id}</span>}
    />,
    i18n
  );
  expect(document.body.textContent).toContain("Druk op de spatiebalk om een item te verplaatsen.");
  expect(container.querySelector('[aria-roledescription="sorteerbaar item"]')).toBeTruthy();
});

it("keeps authored text and accessible controls with long host copy and RTL direction", async () => {
  const i18n = createEditorI18n({
    locales: [...defaultLocales, { id: "ar-XB", nativeName: "Pseudo RTL", direction: "rtl" }],
    catalogs: {
      "ar-XB": {
        editors: { ui: { languageAndFormat: "⟦Language and format — expanded pseudo copy for layout checks⟧" } },
      },
    },
    config: { defaultLocale: "ar-XB" },
  });
  const container = await mount(
    <TiptapRichTextLanguageField
      language="cy"
      value="Enw Cymraeg"
      disallowHTML
      onUpdate={vi.fn()}
      languages={["cy"]}
      onUpdateLanguage={vi.fn()}
    />,
    i18n
  );
  expect(container.querySelector("[data-editor-i18n]")?.getAttribute("dir")).toBe("rtl");
  expect(container.querySelector("textarea")?.value).toBe("Enw Cymraeg");
  expect(
    button(container, "⟦Language and format — expanded pseudo copy for layout checks⟧").getAttribute("aria-controls")
  ).toBeTruthy();
});
