import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  createExternalAnnotationPageInlinePlan,
  findExternalAnnotationPageReferences,
  rewriteAnnotationTarget,
  writeExternalAnnotationPageInlinePlan,
} from "./importer";

const manifestId = "https://example.org/manifest";

function createVault(
  canvases = [createCanvas("https://example.org/canvas/1", "Canvas 1")],
) {
  const vault = new Vault();
  vault.loadManifestSync(manifestId, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestId,
    type: "Manifest",
    label: { en: ["Fixture manifest"] },
    items: canvases,
  });
  return vault;
}

function createCanvas(
  id: string,
  label: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    type: "Canvas",
    label: { en: [label] },
    width: 1000,
    height: 1000,
    items: [],
    annotations: [
      {
        id: `${id}/external-annotations`,
        type: "AnnotationPage",
      },
    ],
    ...overrides,
  };
}

function annotation(id: string, target: unknown, body: unknown = "Body text") {
  return {
    id,
    type: "Annotation",
    motivation: "commenting",
    body,
    target,
  };
}

function annotationPage(id: string, items: unknown[]) {
  return {
    id,
    type: "AnnotationPage",
    label: { en: ["External annotations"] },
    items,
  };
}

function getManifestCanvases(vault: Vault) {
  const manifest = vault.get({ id: manifestId, type: "Manifest" }) as any;
  return vault.get(manifest.items) as any[];
}

describe("external annotation page discovery", () => {
  test("finds external Canvas.annotations pages and ignores inline pages", () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", "Canvas 1"),
      createCanvas("https://example.org/canvas/2", "Canvas 2", {
        annotations: [
          {
            id: "https://example.org/canvas/2/inline-annotations",
            type: "AnnotationPage",
            items: [],
          },
        ],
      }),
    ]);

    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );

    expect(references).toHaveLength(1);
    expect(references[0]?.canvasId).toBe("https://example.org/canvas/1");
    expect(references[0]?.pageId).toBe(
      "https://example.org/canvas/1/external-annotations",
    );
  });
});

describe("external annotation page planning", () => {
  test("validates fetched annotation pages and reports skipped page/items", () => {
    const vault = createVault();
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: [
        {
          reference: references[0]!,
          json: annotationPage(references[0]!.pageId, [
            annotation(
              "https://source/annotation/1",
              "https://old.example/canvas#xywh=1,2,3,4",
            ),
            { id: "https://source/not-annotation", type: "Text" },
          ]),
        },
        {
          reference: {
            ...references[0]!,
            key: "failed",
            pageId: "https://source/missing",
          },
          error: "Unable to fetch https://source/missing (404).",
        },
      ],
    });

    expect(plan.pages).toHaveLength(1);
    expect(plan.totalAnnotations).toBe(1);
    expect(plan.skippedPages).toEqual([
      expect.objectContaining({
        pageId: "https://source/missing",
        reason: "Unable to fetch https://source/missing (404).",
      }),
    ]);
    expect(plan.warnings[0]).toContain("skipped 1 non-Annotation item");
  });

  test("skips duplicate external page references", () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", "Canvas 1", {
        annotations: [
          { id: "https://example.org/shared-page", type: "AnnotationPage" },
        ],
      }),
      createCanvas("https://example.org/canvas/2", "Canvas 2", {
        annotations: [
          { id: "https://example.org/shared-page", type: "AnnotationPage" },
        ],
      }),
    ]);
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: references.map((reference) => ({
        reference,
        json: annotationPage(reference.pageId, []),
      })),
    });

    expect(plan.pages).toHaveLength(1);
    expect(plan.skippedPages).toHaveLength(1);
    expect(plan.skippedPages[0]?.reason).toContain("referenced more than once");
  });
});

describe("external annotation page writing", () => {
  test("rewrites absolute target ids while preserving fragments and selectors", () => {
    expect(
      rewriteAnnotationTarget(
        "https://old/canvas#xywh=1,2,3,4",
        "https://new/canvas",
      ),
    ).toBe("https://new/canvas#xywh=1,2,3,4");
    expect(
      rewriteAnnotationTarget(
        {
          type: "SpecificResource",
          source: "https://old/canvas",
          selector: { type: "FragmentSelector", value: "xywh=1,2,3,4" },
        },
        "https://new/canvas",
      ),
    ).toEqual({
      type: "SpecificResource",
      source: "https://new/canvas",
      selector: { type: "FragmentSelector", value: "xywh=1,2,3,4" },
    });
  });

  test("inlines fetched external annotation pages into the existing Canvas.annotations reference", () => {
    const vault = createVault();
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: [
        {
          reference: references[0]!,
          json: annotationPage(references[0]!.pageId, [
            annotation(
              "https://source/annotation/1",
              "https://old.example/canvas#xywh=1,2,3,4",
              {
                id: "https://source/body/1",
                type: "TextualBody",
                value: "External note",
              },
            ),
          ]),
        },
      ],
    });

    const result = writeExternalAnnotationPageInlinePlan(vault, plan);
    const canvas = vault.get({
      id: "https://example.org/canvas/1",
      type: "Canvas",
    }) as any;
    const page = vault.get(canvas.annotations[0]) as any;
    const writtenAnnotation = vault.get(page.items[0]) as any;
    const writtenBody = vault.get(writtenAnnotation.body[0]) as any;

    expect(result.pagesInlined).toBe(1);
    expect(result.annotationsWritten).toBe(1);
    expect(page.id).toBe("https://example.org/canvas/1/external-annotations");
    expect(page["iiif-parser:isExternal"]).toBe(false);
    expect(writtenAnnotation.target).toBe(
      "https://example.org/canvas/1#xywh=1,2,3,4",
    );
    expect(writtenBody.value).toBe("External note");
  });

  test("preserves Choice annotation bodies and normalises nested body items", () => {
    const vault = createVault();
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: [
        {
          reference: references[0]!,
          json: annotationPage(references[0]!.pageId, [
            annotation(
              "https://source/annotation/choice",
              "https://old.example/canvas",
              {
                type: "Choice",
                items: [
                  {
                    type: "TextualBody",
                    value: "Koto with a cover being carried",
                    language: "en",
                    format: "text/plain",
                  },
                  {
                    type: "TextualBody",
                    value: "袋に収められた琴",
                    language: "ja",
                    format: "text/plain",
                  },
                ],
              },
            ),
          ]),
        },
      ],
    });

    writeExternalAnnotationPageInlinePlan(vault, plan);
    const page = vault.get({
      id: "https://example.org/canvas/1/external-annotations",
      type: "AnnotationPage",
    }) as any;
    const writtenAnnotation = vault.get(page.items[0]) as any;
    const choice = vault.get(writtenAnnotation.body[0]) as any;
    const choiceItems = vault.get(choice.items) as any[];

    expect(writtenAnnotation.body).toHaveLength(1);
    expect(choice.type).toBe("Choice");
    expect(choiceItems.map((item) => item.language)).toEqual(["en", "ja"]);
    expect(choiceItems.map((item) => item.value)).toEqual([
      "Koto with a cover being carried",
      "袋に収められた琴",
    ]);
  });

  test("converts multiple textual annotation bodies into a Choice", () => {
    const vault = createVault();
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: [
        {
          reference: references[0]!,
          json: annotationPage(references[0]!.pageId, [
            annotation(
              "https://source/annotation/multiple",
              "https://old.example/canvas",
              [
                {
                  type: "TextualBody",
                  value: "English body",
                  language: "en",
                  format: "text/plain",
                },
                {
                  type: "TextualBody",
                  value: "Japanese body",
                  language: "ja",
                  format: "text/plain",
                },
              ],
            ),
          ]),
        },
      ],
    });

    writeExternalAnnotationPageInlinePlan(vault, plan);
    const page = vault.get({
      id: "https://example.org/canvas/1/external-annotations",
      type: "AnnotationPage",
    }) as any;
    const writtenAnnotation = vault.get(page.items[0]) as any;
    const choice = vault.get(writtenAnnotation.body[0]) as any;
    const choiceItems = vault.get(choice.items) as any[];

    expect(writtenAnnotation.body).toHaveLength(1);
    expect(choice.type).toBe("Choice");
    expect(choiceItems.map((item) => item.value)).toEqual([
      "English body",
      "Japanese body",
    ]);
  });

  test("generates ids when fetched annotation ids collide with existing resources", () => {
    const vault = createVault([
      createCanvas("https://example.org/canvas/1", "Canvas 1"),
      createCanvas("https://example.org/canvas/2", "Canvas 2", {
        annotations: [
          {
            id: "https://example.org/canvas/2/inline-annotations",
            type: "AnnotationPage",
            items: [
              annotation(
                "https://source/annotation/1",
                "https://example.org/canvas/2",
              ),
            ],
          },
        ],
      }),
    ]);
    const references = findExternalAnnotationPageReferences(
      vault,
      getManifestCanvases(vault),
    );
    const plan = createExternalAnnotationPageInlinePlan({
      loadedPages: [
        {
          reference: references[0]!,
          json: annotationPage(references[0]!.pageId, [
            annotation(
              "https://source/annotation/1",
              "https://old.example/canvas",
            ),
          ]),
        },
      ],
    });

    writeExternalAnnotationPageInlinePlan(vault, plan);
    const page = vault.get({
      id: "https://example.org/canvas/1/external-annotations",
      type: "AnnotationPage",
    }) as any;

    expect(page.items[0].id).not.toBe("https://source/annotation/1");
    expect(page.items[0].id).toContain("/external-annotation-pages/");
  });
});
