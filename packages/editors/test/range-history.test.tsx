import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { Vault } from "@iiif/helpers/vault";
import { EditorInstance, VaultEditSession } from "@manifest-editor/editor-api";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n } from "@manifest-editor/i18n/core";
import { RangeOverview } from "../src/definitions/RangeOverview/RangeOverview";
const fixture = vi.hoisted(() => ({ editor: null as any, fields: new Map<string, any>() }));
vi.mock("@manifest-editor/shell", () => ({
  useEditor: () => fixture.editor,
  useEditingResource: () => ({ resource: { source: { id: "r", type: "Range" } } }),
  useCreator: () => [false, {}],
}));
vi.mock("../src/components/LanguageFieldEditor/LanguageFieldEditor", () => ({
  LanguageFieldEditor: (props: any) => {
    fixture.fields.set(props.focusId, props);
    return null;
  },
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
test.each(["label", "summary", "required-label", "required-value"])(
  "range overview %s edits retain undo grouping after component extraction",
  async (field) => {
    const vault = new Vault({ history: true });
    const ref = { id: "r", type: "Range" as const };
    vault.loadSync("r", {
      ...ref,
      label: { en: ["Original"] },
      summary: { en: ["Summary"] },
      requiredStatement: { label: { en: ["Attribution"] }, value: { en: ["Original credit"] } },
      items: [],
    });
    const editor = new EditorInstance({ vault, reference: ref });
    fixture.editor = editor;
    fixture.fields.clear();
    const root = createRoot(document.createElement("div"));
    const session = new VaultEditSession(vault, "Edit range field");
    try {
      await act(async () =>
        root.render(
          <EditorI18nProvider instance={createEditorI18n()}>
            <ThemeProvider theme={{ color: {}, padding: {}, sizes: {} }}>
              <RangeOverview />
            </ThemeProvider>
          </EditorI18nProvider>
        )
      );
      const { label, summary, requiredStatement } = editor.descriptive;
      const id =
        field === "label"
          ? label.focusId()
          : field === "summary"
            ? summary.focusId()
            : `${requiredStatement.focusId()}_${field === "required-label" ? "label" : "value"}`;
      const props = fixture.fields.get(id);
      expect(props).toBeDefined();
      const before = vault.getState().iiif.entities;
      for (const value of ["First", "Second", "Final"])
        session.run((scoped) =>
          props.onSave({ toInternationalString: () => ({ en: [value] }) }, undefined, undefined, scoped)
        );
      session.finish();
      const after = vault.getState().iiif.entities;
      expect(after).not.toEqual(before);
      expect(vault.history!.getState().undo).toHaveLength(1);
      expect(vault.undo().ok).toBe(true);
      expect(vault.getState().iiif.entities).toEqual(before);
      expect(vault.redo().ok).toBe(true);
      expect(vault.getState().iiif.entities).toEqual(after);
    } finally {
      session.dispose();
      await act(async () => root.unmount());
    }
  }
);
