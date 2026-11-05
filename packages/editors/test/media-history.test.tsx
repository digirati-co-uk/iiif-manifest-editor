import { ThemeProvider } from "styled-components";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { Vault, type Vault as VaultType } from "@iiif/helpers/vault";
import { EditorInstance, VaultEditSession } from "@manifest-editor/editor-api";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n } from "@manifest-editor/i18n/core";
import { VaultProvider } from "react-iiif-vault";
import { MediaEditor } from "../src/definitions/MediaEditor/MediaEditor";
const fixture = vi.hoisted(() => ({
  annotation: null as any,
  resource: null as any,
  changeDuration: undefined as undefined | ((value: number, scoped?: VaultType) => void),
}));
vi.mock("@manifest-editor/shell", () => ({
  useEditor: () => fixture.annotation,
  useGenericEditor: () => fixture.resource,
  useCustomContextMenu: () => {},
  useLayoutActions: () => ({ edit: () => {} }),
}));
vi.mock("../src/components/LanguageFieldEditor/LanguageFieldEditor", () => ({ LanguageFieldEditor: () => null }));
vi.mock("../src/hooks/useAnnotationThumbnail", () => ({ useAnnotationThumbnail: () => null }));
vi.mock("../src/components/DimensionsTriplet", () => ({
  DimensionsTriplet: (props: any) => {
    fixture.changeDuration = props.changeDuration;
    return null;
  },
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
test.each(["Sound", "Video"])("%s duration callbacks use the field's scope and undo the whole edit", async (type) => {
  const vault = new Vault({ history: true });
  vault.loadSync("c", {
    id: "c",
    type: "Canvas",
    width: 100,
    height: 100,
    items: [
      {
        id: "p",
        type: "AnnotationPage",
        items: [
          {
            id: "a",
            type: "Annotation",
            motivation: "painting",
            target: "c",
            body: { id: "media", type, duration: 10 },
          },
        ],
      },
    ],
  });
  fixture.annotation = new EditorInstance({ vault, reference: { id: "a", type: "Annotation" } });
  fixture.resource = new EditorInstance({ vault, reference: { id: "media", type: "ContentResource" } });
  const root = createRoot(document.createElement("div"));
  const session = new VaultEditSession(vault, "Edit duration");
  try {
    await act(async () =>
      root.render(
        <EditorI18nProvider instance={createEditorI18n()}>
          <VaultProvider vault={vault}>
            <ThemeProvider theme={{ color: {}, padding: {}, sizes: {} }}>
              <MediaEditor />
            </ThemeProvider>
          </VaultProvider>
        </EditorI18nProvider>
      )
    );
    expect(fixture.changeDuration).toBeTypeOf("function");
    for (const value of [11, 12, 13]) session.run((scoped) => fixture.changeDuration!(value, scoped));
    session.finish();
    expect(vault.history!.getState().undo).toHaveLength(1);
    expect(vault.undo().ok).toBe(true);
    expect(vault.get({ id: "media", type: "ContentResource" }).duration).toBe(10);
    expect(vault.redo().ok).toBe(true);
    expect(vault.get({ id: "media", type: "ContentResource" }).duration).toBe(13);
  } finally {
    session.dispose();
    await act(async () => root.unmount());
  }
});
