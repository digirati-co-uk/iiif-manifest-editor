import { Vault } from "@iiif/helpers/vault";
import { addMappings, importEntities } from "@iiif/helpers/vault/actions";
import { describe, expect, test } from "vitest";
import {
  combinePaintingAnnotationsIntoChoice,
  getAnnotationThumbnailResource,
  getChoiceBodyInfo,
  getChoiceItems,
  getContentResourceThumbnailResource,
  getPaintingChoiceCandidates,
  unwrapChoicePaintingAnnotation,
} from "../helpers/choice-painting-annotations";

const manifestRef = { id: "https://example.org/manifest", type: "Manifest" as const };
const canvasRef = { id: "https://example.org/canvas/1", type: "Canvas" as const };
const pageRef = { id: "https://example.org/canvas/1/page", type: "AnnotationPage" as const };

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    ...manifestRef,
    label: { en: ["Test manifest"] },
    items: [
      {
        ...canvasRef,
        label: { en: ["Canvas 1"] },
        height: 1000,
        width: 1000,
        items: [
          {
            ...pageRef,
            items: [
              {
                id: "https://example.org/annotation/1",
                type: "Annotation",
                motivation: "painting",
                label: { en: ["First annotation"] },
                body: {
                  id: "https://example.org/image/1.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  width: 1000,
                  height: 1000,
                },
                target: "https://example.org/canvas/1#xywh=10,20,300,400",
              },
              {
                id: "https://example.org/annotation/2",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://example.org/image/2.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  label: { en: ["Unselected"] },
                  width: 1000,
                  height: 1000,
                },
                target: "https://example.org/canvas/1",
              },
              {
                id: "https://example.org/annotation/3",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://example.org/image/3.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  width: 1000,
                  height: 1000,
                },
                target: "https://example.org/canvas/1#xywh=50,60,300,400",
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

describe("painting annotation Choices", () => {
  test("combines selected image annotations into one Choice annotation", () => {
    const vault = createVault();
    const firstTarget = vault.get<any>({ id: "https://example.org/annotation/1", type: "Annotation" }).target;
    const result = combinePaintingAnnotationsIntoChoice(vault, {
      annotationPageRef: pageRef,
      selectedAnnotationIds: ["https://example.org/annotation/1", "https://example.org/annotation/3"],
      defaultLanguage: "en",
    });

    const page = vault.get<any>(pageRef);
    expect(page.items).toEqual([
      result,
      { id: "https://example.org/annotation/2", type: "Annotation" },
    ]);

    const annotation = vault.get<any>(result);
    expect(annotation.motivation).toBe("painting");
    expect(annotation.target).toEqual(firstTarget);

    const choice = vault.get<any>(annotation.body[0]);
    expect(choice.type).toBe("Choice");
    expect(choice.items).toEqual([
      { id: "https://example.org/image/1.jpg", type: "ContentResource" },
      { id: "https://example.org/image/3.jpg", type: "ContentResource" },
    ]);
    expect(vault.get<any>({ id: "https://example.org/image/1.jpg", type: "ContentResource" }).label).toEqual({
      en: ["First annotation"],
    });
    expect(vault.get<any>({ id: "https://example.org/image/3.jpg", type: "ContentResource" }).label).toEqual({
      en: ["Option 2"],
    });

    const exported = vault.toPresentation3<any>(manifestRef);
    const exportedAnnotation = exported.items[0].items[0].items[0];
    expect(exportedAnnotation.body.type).toBe("Choice");
    expect(exportedAnnotation.body.items.map((item: any) => item.label)).toEqual([
      { en: ["First annotation"] },
      { en: ["Option 2"] },
    ]);
  });

  test("rejects combining fewer than two annotations", () => {
    const vault = createVault();
    expect(() =>
      combinePaintingAnnotationsIntoChoice(vault, {
        annotationPageRef: pageRef,
        selectedAnnotationIds: ["https://example.org/annotation/1"],
      }),
    ).toThrow(/at least two/);
  });

  test("unwraps a Choice annotation back into individual painting annotations", () => {
    const vault = createVault();
    const choiceAnnotationRef = combinePaintingAnnotationsIntoChoice(vault, {
      annotationPageRef: pageRef,
      selectedAnnotationIds: ["https://example.org/annotation/1", "https://example.org/annotation/3"],
      defaultLanguage: "en",
    });
    const choiceAnnotation = vault.get<any>(choiceAnnotationRef);
    const result = unwrapChoicePaintingAnnotation(vault, {
      annotationRef: choiceAnnotationRef,
      annotationPageRef: pageRef,
    });

    expect(result.annotationRefs).toHaveLength(2);
    expect(result.annotationPageRef).toEqual(pageRef);
    expect(result.index).toBe(0);

    const page = vault.get<any>(pageRef);
    expect(page.items).toEqual([
      result.annotationRefs[0],
      result.annotationRefs[1],
      { id: "https://example.org/annotation/2", type: "Annotation" },
    ]);

    const first = vault.get<any>(result.annotationRefs[0]!);
    const second = vault.get<any>(result.annotationRefs[1]!);
    expect(first.motivation).toBe("painting");
    expect(first.target).toEqual(choiceAnnotation.target);
    expect(second.target).toEqual(choiceAnnotation.target);
    expect(first.body).toEqual([{ id: "https://example.org/image/1.jpg", type: "ContentResource" }]);
    expect(second.body).toEqual([{ id: "https://example.org/image/3.jpg", type: "ContentResource" }]);

    const exported = vault.toPresentation3<any>(manifestRef);
    const exportedPageItems = exported.items[0].items[0].items;
    expect(exportedPageItems).toHaveLength(3);
    expect(exportedPageItems[0].body.type).toBe("Image");
    expect(exportedPageItems[1].body.type).toBe("Image");
    expect(exportedPageItems[2].id).toBe("https://example.org/annotation/2");
  });

  test("detects imported embedded Choice bodies", () => {
    const vault = new Vault();
    vault.loadManifestSync(manifestRef.id, {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      ...manifestRef,
      label: { en: ["Test manifest"] },
      items: [
        {
          ...canvasRef,
          height: 1271,
          width: 2000,
          items: [
            {
              ...pageRef,
              items: [
                {
                  id: "https://example.org/annotation/choice",
                  type: "Annotation",
                  motivation: "painting",
                  body: {
                    type: "Choice",
                    items: [
                      {
                        id: "https://example.org/natural.jpg",
                        type: "Image",
                        format: "image/jpeg",
                        label: { en: ["Natural Light"] },
                      },
                      {
                        id: "https://example.org/xray.jpg",
                        type: "Image",
                        format: "image/jpeg",
                        label: { en: ["X-Ray"] },
                      },
                    ],
                  },
                  target: canvasRef.id,
                },
              ],
            },
          ],
        },
      ],
    });

    const annotation = vault.get<any>({ id: "https://example.org/annotation/choice", type: "Annotation" });
    const choiceInfo = getChoiceBodyInfo(annotation, vault);
    expect(choiceInfo?.choice.type).toBe("Choice");
    expect(getAnnotationThumbnailResource(annotation, vault).id).toBe("https://example.org/natural.jpg");
    expect(getChoiceItems(choiceInfo?.choice, vault).map((item) => item.resource.label)).toEqual([
      { en: ["Natural Light"] },
      { en: ["X-Ray"] },
    ]);

    const candidates = getPaintingChoiceCandidates(vault, [{ id: annotation.id, type: "Annotation" }]);
    expect(candidates[0]?.eligible).toBe(false);
    expect(candidates[0]?.disabledReason).toBe("Already a Choice");
  });

  test("resolves referenced Choice bodies from ContentResource entities", () => {
    const vault = new Vault();
    const choiceId = "https://example.org/choice/1";
    const annotationId = "https://example.org/annotation/referenced-choice";

    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [choiceId]: {
              id: choiceId,
              type: "Choice",
              label: { en: ["Inspection mode"] },
              items: [
                { id: "https://example.org/natural.jpg", type: "ContentResource" },
                { id: "https://example.org/xray.jpg", type: "ContentResource" },
              ],
            },
            "https://example.org/natural.jpg": {
              id: "https://example.org/natural.jpg",
              type: "Image",
              label: { en: ["Natural Light"] },
            },
            "https://example.org/xray.jpg": {
              id: "https://example.org/xray.jpg",
              type: "Image",
              label: { en: ["X-Ray"] },
            },
          },
          Annotation: {
            [annotationId]: {
              id: annotationId,
              type: "Annotation",
              motivation: "painting",
              body: [{ id: choiceId, type: "Choice" }],
              target: canvasRef.id,
            },
          },
        },
      }),
    );
    vault.dispatch(
      addMappings({
        mapping: {
          [choiceId]: "ContentResource",
          "https://example.org/natural.jpg": "ContentResource",
          "https://example.org/xray.jpg": "ContentResource",
          [annotationId]: "Annotation",
        },
      }),
    );

    const annotation = vault.get<any>({ id: annotationId, type: "Annotation" });
    const choiceInfo = getChoiceBodyInfo(annotation, vault);
    expect(choiceInfo?.choice.label).toEqual({ en: ["Inspection mode"] });
    expect(choiceInfo?.ref).toEqual({ id: choiceId, type: "ContentResource" });
    expect(getContentResourceThumbnailResource({ id: choiceId, type: "ContentResource" }, vault).id).toBe(
      "https://example.org/natural.jpg",
    );
    expect(getChoiceItems(choiceInfo?.choice, vault).map((item) => item.resource.label)).toEqual([
      { en: ["Natural Light"] },
      { en: ["X-Ray"] },
    ]);
  });
});
