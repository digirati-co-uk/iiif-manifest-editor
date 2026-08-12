import { Vault4 } from "@iiif/helpers/vault-4";
import { Creator } from "@manifest-editor/creator-api";
import { describe, expect, test, vi } from "vitest";
import { htmlAnnotation } from "../../../creators/src/Annotation/HTMLAnnotation";
import { modelAnnotation } from "../../../creators/src/Annotation/ModelAnnotation";
import { emptyAnnotationPage } from "../../../creators/src/AnnotationPage/EmptyAnnotationPage";
import { htmlBodyCreator } from "../../../creators/src/ContentResource/HTMLBodyCreator";
import { scenePointTarget } from "../helpers/scene-annotation-creation";

vi.mock("@manifest-editor/components", () => ({
  ActionButton: () => null,
  EmptyCanvasIcon: () => null,
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
    vault.loadManifestSync(manifest.id, {
      ...manifest,
      label: { en: ["Manifest"] },
      items: [],
    });

    const creator = new Creator(
      vault,
      [modelAnnotation, emptyAnnotationPage, htmlAnnotation, htmlBodyCreator] as any,
    );
    const createdScene = await creator.create(
      modelAnnotation.id,
      { url: "https://fixtures.iiif.io/3d/thomas_flynn/chess/Pawn_black.glb" },
      {
        targetType: "Canvas",
        parent: { resource: manifest, property: "items" },
      },
    );
    const scene = Array.isArray(createdScene) ? createdScene[0]! : createdScene;
    expect((vault.get(scene) as any).annotations).toEqual([]);
    vault.modifyEntityField(scene as any, "annotations", undefined as any);
    const pointTarget = scenePointTarget(scene.id, [1, 2, 3]);
    const page = await creator.create(
      emptyAnnotationPage.id,
      { label: { en: ["Scene annotations"] } },
      {
        target: scene,
        targetType: "AnnotationPage",
        parent: { resource: scene, property: "annotations" },
      },
    );
    const pageRef = Array.isArray(page) ? page[0]! : page;
    await creator.create(
      htmlAnnotation.id,
      { body: { en: ["<p>Hello 3D</p>"] } },
      {
        targetType: "Annotation",
        target: scene,
        parent: { resource: pageRef, property: "items" },
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
