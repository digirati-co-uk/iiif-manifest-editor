import { Vault4 } from "@iiif/helpers/vault-4";
import { Creator } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { htmlAnnotation } from "../../../creators/src/Annotation/HTMLAnnotation";
import { htmlBodyCreator } from "../../../creators/src/ContentResource/HTMLBodyCreator";
import { scenePointTarget } from "../helpers/scene-annotation-creation";

vi.mock("@manifest-editor/components", () => ({
  ActionButton: () => null,
  HTMLIcon: () => null,
  HTMLEditor: () => null,
  PaddedSidebarContainer: () => null,
}));
vi.mock("@manifest-editor/editors", () => ({
  InputContainer: () => null,
  InputLabel: () => null,
  LanguageFieldEditor: () => null,
  RichTextLanguageField: () => null,
}));
vi.mock("@manifest-editor/shell", () => ({
  useAnnotationCreatorState: () => [{ en: [""] }, () => undefined],
  useConfig: () => ({ i18n: { defaultLanguage: "en" } }),
}));

describe("3D annotation serialization", () => {
  test("creates P4 HTML commenting annotation targeted to a Scene point", async () => {
    const vault = new Vault4();
    const manifest = { id: "https://example.org/manifest", type: "Manifest" as const };
    const scene = { id: `${manifest.id}/scene`, type: "Scene" as const };
    const page = { id: `${scene.id}/annotations`, type: "AnnotationPage" as const };
    vault.loadManifestSync(manifest.id, {
      ...manifest,
      label: { en: ["Manifest"] },
      items: [{ ...scene, items: [], annotations: [{ ...page, items: [] }] }],
    });

    const pointTarget = scenePointTarget(scene.id, [1, 2, 3]);
    const creator = new Creator(vault, [htmlAnnotation, htmlBodyCreator] as any);
    await creator.create(
      htmlAnnotation.id,
      { body: { en: ["<p>Hello 3D</p>"] } },
      {
        targetType: "Annotation",
        target: scene,
        parent: { resource: page, property: "items" },
        initialData: {
          motivation: "commenting",
          getSerialisedSelector: () => pointTarget.selector,
        },
      },
    );

    const exported = vault.toPresentation4<any>(manifest);
    const annotation = exported.items[0].annotations[0].items[0];
    expect(annotation).toMatchObject({
      type: "Annotation",
      motivation: ["commenting"],
      body: {
        type: "TextualBody",
        format: "text/html",
        value: "<p>Hello 3D</p>",
      },
      target: pointTarget,
    });
  });
});
