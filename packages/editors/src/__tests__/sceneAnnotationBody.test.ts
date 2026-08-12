import { Vault4 } from "@iiif/helpers/vault-4";
import { describe, expect, test } from "vitest";
import { annotationBodyType } from "../definitions/Model3DEditor";
import {
  getFirstAnnotationBody,
  resolveFirstAnnotationBody,
  setAnnotationBodyTransforms,
} from "../helpers/scene-annotation-body";

describe("Presentation 4 annotation bodies", () => {
  test("matches a normalized singleton Model body", async () => {
    const vault = new Vault4();
    const manifest = (await vault.loadManifest("https://example.org/manifest", {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      id: "https://example.org/manifest",
      type: "Manifest",
      label: { en: ["Model"] },
      items: [
        {
          id: "https://example.org/scene",
          type: "Scene",
          label: { en: ["Scene"] },
          items: [
            {
              id: "https://example.org/page",
              type: "AnnotationPage",
              items: [
                {
                  id: "https://example.org/annotation",
                  type: "Annotation",
                  motivation: "painting",
                  target: "https://example.org/scene",
                  body: {
                    id: "https://example.org/model.glb",
                    type: "Model",
                    format: "model/gltf-binary",
                  },
                },
              ],
            },
          ],
        },
      ],
    } as any))!;

    const scene = vault.get(manifest.items[0]!);
    const page = vault.get(scene.items[0]!);
    const annotation = page.items[0]!;

    expect(annotationBodyType({ resource: annotation }, vault)).toBe("Model");
    expect(getFirstAnnotationBody(vault.get(annotation))).toMatchObject({
      id: "https://example.org/model.glb",
    });
    expect(resolveFirstAnnotationBody(vault.get(annotation), vault)).toMatchObject({
      id: "https://example.org/model.glb",
      type: "Model",
    });

    setAnnotationBodyTransforms(
      annotation,
      [
        { type: "RotateTransform", x: 0, y: 90, z: 0 },
        { type: "TranslateTransform", x: 2, y: 0, z: 0 },
      ],
      vault
    );
    const serialised = vault.toPresentation4<any>(manifest);
    expect(serialised.items[0].items[0].items[0].body).toMatchObject({
      type: "SpecificResource",
      source: { id: "https://example.org/model.glb", type: "Model" },
      transform: [
        { type: "RotateTransform", x: 0, y: 90, z: 0 },
        { type: "TranslateTransform", x: 2, y: 0, z: 0 },
      ],
    });

    setAnnotationBodyTransforms(
      annotation,
      [
        { type: "ScaleTransform", x: 1.5, y: 1.5, z: 1.5 },
        { type: "TranslateTransform", x: 2.5, y: 0, z: 0 },
      ],
      vault
    );
    expect(vault.toPresentation4<any>(manifest).items[0].items[0].items[0].body.transform).toEqual([
      { type: "ScaleTransform", x: 1.5, y: 1.5, z: 1.5 },
      { type: "TranslateTransform", x: 2.5, y: 0, z: 0 },
    ]);
  });
});
