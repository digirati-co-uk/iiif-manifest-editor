import { Vault } from "@iiif/vault";
import { EditorInstance } from "@/editor-api/EditorInstance";
import { Creator } from "@/creator-api";
import { allCreators } from "@/_creators";
import { EditorConfig } from "@/editor-api/types";
import { ManifestNormalized } from "@iiif/presentation-3-normalized";
import { expect, vi } from "vitest";
import { CreateImageServiceAnnotationPayload } from "@/_creators/Annotation/ImageServiceAnnotation/create-service-annotation";
import nlsManifest from "../fixtures/nls-manifest.json";
import deepmerge from "deepmerge";

vi.mock("uuid", () => {
  return { v4: () => "<string>" };
});

describe("Creation of Delft exhibition", () => {
  // This uses the Creator and Editor APIs to construct Delft-like canvases individually in each test.
  // Each canvas is a step in the exhibition. If each type of canvas can be created using these APIs then
  // the UI can in turn be created and will make compatible canvases.
  test("Creation of introduction panel", async () => {
    const { vault, manifest, creator, edit, editor } = await createEditor();

    // 2 elements to the introduction panel
    // - An HTML body
    // - A describing annotation with textual body (NOT a tour)

    // 1st create an empty canvas.
    const canvas = await creator.create(
      "@manifest-editor/empty-canvas",
      {},
      { parent: { resource: manifest, property: "items" } }
    );

    const full = vault.get(canvas);
    const annoPage = full.items[0];

    // 2nd create HTML Annotation on the body.
    await creator.create(
      "@manifest-editor/html-annotation",
      {
        body: {
          en: ["This is some <strong>example</strong> html for the form"],
          nl: ["This is some <strong>example</strong> html for the form (NL)"],
        },
      },
      {
        parent: { resource: annoPage, property: "items" },
        target: canvas,
      }
    );

    // 3rd add custom behavior and label to canvas.
    const canvasEditor = edit(canvas);

    canvasEditor.descriptive.label.set({ en: ["Introduction"] });
    canvasEditor.technical.behavior.set(["info", "w-4", "h-4"]);

    // 4th - add new annotation page.
    const annotations = await creator.create(
      "@manifest-editor/empty-annotation-page",
      {},
      {
        parent: { resource: canvas, property: "annotations" },
      }
    );

    // 5th - Add new HTML annotation to that page.
    await creator.create(
      "@manifest-editor/html-annotation",
      {
        body: { en: ["This is an <strong>html</strong> describing annotation"] },
        motivation: "describing",
      },
      { parent: { resource: annotations, property: "items" } }
    );

    expect(vault.toPresentation3(manifest as any)).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://example.org/exhibition-manifest",
        "items": [
          {
            "annotations": [
              {
                "id": "https://example.org/exhibition-manifest/canvas/<string>/annotations/<string>",
                "items": [
                  {
                    "body": {
                      "format": "text/html",
                      "id": "https://example.org/exhibition-manifest/canvas/<string>/annotations/<string>/annotation/<string>/html/en/<string>",
                      "language": "en",
                      "type": "TextualBody",
                      "value": "This is an <strong>html</strong> describing annotation",
                    },
                    "id": "https://example.org/exhibition-manifest/canvas/<string>/annotations/<string>/annotation/<string>",
                    "motivation": "describing",
                    "target": {
                      "id": "https://example.org/exhibition-manifest/canvas/<string>/annotations/<string>",
                      "type": "AnnotationPage",
                    },
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "behavior": [
              "info",
              "w-4",
              "h-4",
            ],
            "height": 1000,
            "id": "https://example.org/exhibition-manifest/canvas/<string>",
            "items": [
              {
                "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>",
                "items": [
                  {
                    "body": [
                      {
                        "format": "text/html",
                        "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>/annotation/<string>/html/en/<string>",
                        "language": "en",
                        "type": "TextualBody",
                        "value": "This is some <strong>example</strong> html for the form",
                      },
                      {
                        "format": "text/html",
                        "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>/annotation/<string>/html/nl/<string>",
                        "language": "nl",
                        "type": "TextualBody",
                        "value": "This is some <strong>example</strong> html for the form (NL)",
                      },
                    ],
                    "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>/annotation/<string>",
                    "motivation": "painting",
                    "target": "https://example.org/exhibition-manifest/canvas/<string>",
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "en": [
                "Introduction",
              ],
            },
            "type": "Canvas",
            "width": 1000,
          },
        ],
        "type": "Manifest",
      }
    `);
  });

  test("Creation of youtube canvas", async () => {
    // The YouTube canvas is a non-standard annotation, but is viewable in the Delft editor and canvas panel.
    // In this example we also need to add a thumbnail to the canvas.
    const { manifest, vault, editor, edit, creator } = await createEditor();

    // 1. Create a canvas from YouTube video.
    const canvas = await creator.create(
      "@manifest-editor/youtube",
      {
        label: { en: ["Youtube video"] },
        youtubeUrl: "https://www.youtube.com/watch?v=kv6YvKPXQzk",
        height: 1920,
        width: 1080,
        duration: 10,
      },
      { parent: { resource: manifest, property: "items" }, targetType: "Canvas" }
    );

    const annotationPage = vault.get(canvas).items[0];
    const annotation = vault.get(annotationPage).items[0];

    // 2. Add some metadata to the annotation.
    const annoEditor = edit(annotation);
    annoEditor.descriptive.label.set({ en: ["Solar Do-Nothing Machine, a film by Charles and Ray Eames (1957)"] });
    annoEditor.descriptive.summary.set({
      en: [
        "In 1957 the Aluminum Company of America, or Alcoa, whose business consisted of a mix of military contracts and consumer products, hired the famed design firm of Charles and Ray Eames to create a fanciful, brightly colored “Do-Nothing Machine.” Resembling a piece of modern art, the project promoted Alcoa’s new photovoltaic cells not by showing their application to any­thing useful, but by challenging would-be clients to come up with their own uses while lending the corporation a whimsical, artsy vibe. Eames Office, LLC. All rights reserved",
      ],
    });

    // 3. Add a thumbnail to the annotation AND canvas
    // https://dlc.services/iiif-img/7/21/76c17db9-e1cd-479d-8726-e995c478f2ad/1000,0,3876,3876/1600,1600/0/default.jpg
    await creator.create(
      "@manifest-editor/image-url-creator",
      {
        url: "https://dlc.services/iiif-img/7/21/76c17db9-e1cd-479d-8726-e995c478f2ad/1000,0,3876,3876/1600,1600/0/default.jpg",
      },
      {
        parent: { resource: canvas, property: "thumbnail" },
      }
    );

    // Add behavior to canvas
    const canvasEditor = edit(canvas);
    canvasEditor.technical.behavior.set(["left", "w-8", "h-8"]);

    expect(vault.toPresentation3(manifest)).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://example.org/exhibition-manifest",
        "items": [
          {
            "behavior": [
              "left",
              "w-8",
              "h-8",
            ],
            "duration": 10,
            "height": 1920,
            "id": "https://example.org/exhibition-manifest/canvas/<string>",
            "items": [
              {
                "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>",
                "items": [
                  {
                    "body": {
                      "id": "https://www.youtube.com/watch?v=kv6YvKPXQzk",
                      "service": [
                        {
                          "params": {
                            "data": "https://www.youtube.com/embed/kv6YvKPXQzk",
                          },
                          "profile": "http://digirati.com/objectifier",
                        },
                        {
                          "id": "https://www.youtube.com/watch?v=kv6YvKPXQzk",
                          "profile": "https://www.youtube.com",
                        },
                      ],
                      "type": "Video",
                    },
                    "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>/annotation/<string>",
                    "label": {
                      "en": [
                        "Solar Do-Nothing Machine, a film by Charles and Ray Eames (1957)",
                      ],
                    },
                    "motivation": "painting",
                    "summary": {
                      "en": [
                        "In 1957 the Aluminum Company of America, or Alcoa, whose business consisted of a mix of military contracts and consumer products, hired the famed design firm of Charles and Ray Eames to create a fanciful, brightly colored “Do-Nothing Machine.” Resembling a piece of modern art, the project promoted Alcoa’s new photovoltaic cells not by showing their application to any­thing useful, but by challenging would-be clients to come up with their own uses while lending the corporation a whimsical, artsy vibe. Eames Office, LLC. All rights reserved",
                      ],
                    },
                    "target": "https://example.org/exhibition-manifest/canvas/<string>",
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "en": [
                "Youtube video",
              ],
            },
            "thumbnail": [
              {
                "format": "image/jpeg",
                "id": "https://dlc.services/iiif-img/7/21/76c17db9-e1cd-479d-8726-e995c478f2ad/1000,0,3876,3876/1600,1600/0/default.jpg",
                "type": "Image",
              },
            ],
            "type": "Canvas",
            "width": 1080,
          },
        ],
        "type": "Manifest",
      }
    `);
  });

  test("Creation of composite image (no cropping)", async () => {
    // This is a standard composite image where multiple image annotations are arranged on a canvas.
    // There will be an extra operation to "fit" content on the canvas.
    // This is the first time that the target will be changed too.
    // Each _annotation_ will have a thumbnail image too.
    const { manifest, vault, editor, edit, creator } = await createEditor();

    // 1st create empty canvas.
    const canvas = await creator.create(
      "@manifest-editor/empty-canvas",
      {
        label: { en: ["Creativity, Consumerism, and the Cold War"] },
        height: 774,
        width: 774,
      },
      { parent: { resource: manifest, property: "items" } }
    );

    const page = vault.get(canvas).items[0];

    // 2nd add an image to it.
    const annotation1 = await creator.create(
      "@manifest-editor/image-service-annotation",
      {
        url: fixtures.imageService1.id,
        service: fixtures.imageService1 as any,
        embedService: true,
        size: { width: 798, height: 1024 },
      } as CreateImageServiceAnnotationPayload,
      {
        parent: { resource: page, property: "items" },
        target: canvas,
      }
    );

    // // 3rd add thumbnail to the annotation.
    await creator.create(
      "@manifest-editor/image-service-creator",
      {
        url: fixtures.thumbnailImageService1.id,
        service: fixtures.thumbnailImageService1 as any,
        size: { width: 798, height: 1024 },
      } as CreateImageServiceAnnotationPayload,
      {
        parent: { resource: annotation1, property: "thumbnail" },
      }
    );

    // 4th - change the position of the image + Add metadata
    const anno = edit(annotation1);
    anno.annotation.target.setPosition({
      x: 28,
      y: 33,
      width: 297,
      height: 381,
    });

    anno.descriptive.label.set({ en: ["Chicago Commuters, 1953"] });
    anno.descriptive.summary.set({
      en: [
        "As the United States competed with the Soviet Union in a race of military technology, its economy depended on a constant stream of consumer goods. Many saw totalitarianism abroad and consumerism at home as twin threats to individualism. (Photo by Dan Weiner. Copyright John Broderick)",
      ],
    });

    // 6th add another image (should position in the middle, half the size)

    expect(vault.toPresentation3(manifest)).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://example.org/exhibition-manifest",
        "items": [
          {
            "height": 774,
            "id": "https://example.org/exhibition-manifest/canvas/<string>",
            "items": [
              {
                "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>",
                "items": [
                  {
                    "body": {
                      "format": "image/jpeg",
                      "height": 6415,
                      "id": "https://dlc.services/iiif-img/7/21/2b424897-33e9-4162-ac8a-7b247505905e/full/798,1024/0/default.jpg",
                      "service": [
                        {
                          "@id": "https://dlc.services/iiif-img/7/21/2b424897-33e9-4162-ac8a-7b247505905e",
                          "@type": "ImageService2",
                          "height": 6415,
                          "profile": "http://iiif.io/api/image/2/level1.json",
                          "protocol": "http://iiif.io/api/image",
                          "sizes": [
                            {
                              "height": 1024,
                              "width": 798,
                            },
                            {
                              "height": 400,
                              "width": 312,
                            },
                            {
                              "height": 200,
                              "width": 156,
                            },
                            {
                              "height": 100,
                              "width": 78,
                            },
                          ],
                          "tiles": [
                            {
                              "height": 256,
                              "scaleFactors": [
                                1,
                                2,
                                4,
                                8,
                                16,
                                32,
                              ],
                              "width": 256,
                            },
                          ],
                          "width": 5000,
                        },
                      ],
                      "type": "Image",
                      "width": 5000,
                    },
                    "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>/annotation/<string>",
                    "label": {
                      "en": [
                        "Chicago Commuters, 1953",
                      ],
                    },
                    "motivation": "painting",
                    "summary": {
                      "en": [
                        "As the United States competed with the Soviet Union in a race of military technology, its economy depended on a constant stream of consumer goods. Many saw totalitarianism abroad and consumerism at home as twin threats to individualism. (Photo by Dan Weiner. Copyright John Broderick)",
                      ],
                    },
                    "target": "https://example.org/exhibition-manifest/canvas/<string>#xywh=28,33,297,381",
                    "thumbnail": [
                      {
                        "format": "image/jpeg",
                        "height": 1024,
                        "id": "https://dlc.services/thumbs/7/21/2b424897-33e9-4162-ac8a-7b247505905e/full/798,1024/0/default.jpg",
                        "service": [
                          {
                            "@id": "https://dlc.services/thumbs/7/21/2b424897-33e9-4162-ac8a-7b247505905e",
                            "@type": "ImageService2",
                            "height": 1024,
                            "profile": "http://iiif.io/api/image/2/level0.json",
                            "protocol": "http://iiif.io/api/image",
                            "sizes": [
                              {
                                "height": 100,
                                "width": 78,
                              },
                              {
                                "height": 200,
                                "width": 156,
                              },
                              {
                                "height": 400,
                                "width": 312,
                              },
                              {
                                "height": 1024,
                                "width": 798,
                              },
                            ],
                            "width": 798,
                          },
                        ],
                        "type": "Image",
                        "width": 798,
                      },
                    ],
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "en": [
                "Creativity, Consumerism, and the Cold War",
              ],
            },
            "type": "Canvas",
            "width": 774,
          },
        ],
        "type": "Manifest",
      }
    `);
  });

  test("Creating annotation from content state", async () => {
    const { manifest, vault, editor, edit, creator, previewVault } = await createEditor();

    await previewVault.loadManifest(nlsManifest["@id"], deepmerge({}, nlsManifest));

    // create empty canvas.
    const canvas = await creator.create(
      "@manifest-editor/empty-canvas",
      {
        label: { en: ["Creativity, Consumerism, and the Cold War"] },
        height: 774,
        width: 774,
      },
      { parent: { resource: manifest, property: "items" } }
    );

    const page = vault.get(canvas).items[0];

    await creator.create(
      "@manifest-editor/iiif-browser-creator",
      {
        output: {
          "@context": "http://iiif.io/api/presentation/3/context.json",
          id: "",
          type: "Annotation",
          motivation: ["contentState"],
          target: {
            id: "https://view.nls.uk/iiif/7446/74464117/canvas/1",
            type: "Canvas",
            partOf: [{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }],
          },
        },
      },
      {
        parent: {
          resource: page,
          property: "items",
        },
        target: canvas,
        targetType: "Annotation",
      }
    );

    expect(vault.toPresentation3(manifest)).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://example.org/exhibition-manifest",
        "items": [
          {
            "height": 1868,
            "id": "https://example.org/exhibition-manifest/canvas/<string>",
            "items": [
              {
                "id": "https://example.org/exhibition-manifest/canvas/<string>/annotation-page/<string>",
                "items": [
                  {
                    "body": {
                      "format": "image/jpeg",
                      "height": 1868,
                      "id": "https://view.nls.uk/iiif/7443/74438561.5/full/full/0/native.jpg",
                      "service": [
                        {
                          "@id": "https://view.nls.uk/iiif/7443/74438561.5",
                          "@type": "ImageService2",
                          "profile": "level2",
                        },
                      ],
                      "type": "Image",
                      "width": 2500,
                    },
                    "id": "https://view.nls.uk/iiif/7443/74438561.5/annotation",
                    "motivation": "painting",
                    "target": "https://example.org/exhibition-manifest/canvas/<string>",
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "en": [
                "Creativity, Consumerism, and the Cold War",
              ],
            },
            "type": "Canvas",
            "width": 2500,
          },
        ],
        "type": "Manifest",
      }
    `);
  });

  test("Creating canvas from content state", async () => {
    const { manifest, vault, editor, edit, creator, previewVault } = await createEditor();

    await previewVault.loadManifest(nlsManifest["@id"], deepmerge({}, nlsManifest));

    await creator.create(
      "@manifest-editor/iiif-browser-creator",
      {
        output: {
          "@context": "http://iiif.io/api/presentation/3/context.json",
          id: "",
          type: "Annotation",
          motivation: ["contentState"],
          target: {
            id: "https://view.nls.uk/iiif/7446/74464117/canvas/1",
            type: "Canvas",
            partOf: [{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }],
          },
        },
      },
      {
        parent: {
          resource: manifest,
          property: "items",
        },
        targetType: "Canvas",
      }
    );

    expect(vault.toPresentation3(manifest)).toMatchInlineSnapshot(`
      {
        "@context": "http://iiif.io/api/presentation/3/context.json",
        "id": "https://example.org/exhibition-manifest",
        "items": [
          {
            "height": 1868,
            "id": "https://view.nls.uk/iiif/7446/74464117/canvas/1",
            "items": [
              {
                "id": "https://view.nls.uk/iiif/7446/74464117/canvas/1/annotation-page",
                "items": [
                  {
                    "body": {
                      "format": "image/jpeg",
                      "height": 1868,
                      "id": "https://view.nls.uk/iiif/7443/74438561.5/full/full/0/native.jpg",
                      "service": [
                        {
                          "@id": "https://view.nls.uk/iiif/7443/74438561.5",
                          "@type": "ImageService2",
                          "profile": "level2",
                        },
                      ],
                      "type": "Image",
                      "width": 2500,
                    },
                    "id": "https://view.nls.uk/iiif/7443/74438561.5/annotation",
                    "motivation": "painting",
                    "target": "https://view.nls.uk/iiif/7446/74464117/canvas/1",
                    "type": "Annotation",
                  },
                ],
                "type": "AnnotationPage",
              },
            ],
            "label": {
              "none": [
                "1",
              ],
            },
            "thumbnail": [
              {
                "height": 113,
                "id": "https://deriv.nls.uk/dcn4/7443/74438561.4.jpg",
                "type": "Image",
                "width": 150,
              },
            ],
            "type": "Canvas",
            "width": 2500,
          },
        ],
        "type": "Manifest",
      }
    `);
  });

  const startingManifest = () => ({
    id: "https://example.org/exhibition-manifest",
    "@context": "http://iiif.io/api/presentation/3/context.json",
    type: "Manifest",
    items: [],
  });
  const createEditor = async () => {
    const vault = new Vault({
      customFetcher: (url) => {
        throw new Error("No requesting during tests " + url);
      },
    });
    const previewVault = new Vault({
      customFetcher: (url) => {
        throw new Error("No requesting during tests " + url);
      },
    });
    const empty = startingManifest();
    const manifest: ManifestNormalized = (await vault.loadManifest(empty.id, empty)) as any;
    const editor = new EditorInstance({
      reference: { id: empty.id, type: "Manifest" },
      vault,
    });

    const creator = new Creator(vault, allCreators, previewVault);

    const edit = (reference: any, context?: EditorConfig["context"]) =>
      new EditorInstance({ vault, reference, context });

    return { vault, previewVault, manifest, editor, creator, edit } as const;
  };

  const fixtures = {
    thumbnailImageService1: {
      type: "ImageService2",
      id: "https://dlc.services/thumbs/7/21/2b424897-33e9-4162-ac8a-7b247505905e",
      protocol: "http://iiif.io/api/image",
      profile: [
        "http://iiif.io/api/image/2/level0.json",
        {
          formats: ["jpg"],
          qualities: ["color"],
          supports: ["sizeByWhListed"],
        },
      ],
      width: 798,
      height: 1024,
      sizes: [
        {
          width: 78,
          height: 100,
        },
        {
          width: 156,
          height: 200,
        },
        {
          width: 312,
          height: 400,
        },
        {
          width: 798,
          height: 1024,
        },
      ],
    },
    imageService1: {
      type: "ImageService2",
      id: "https://dlc.services/iiif-img/7/21/2b424897-33e9-4162-ac8a-7b247505905e",
      protocol: "http://iiif.io/api/image",
      width: 5000,
      height: 6415,
      tiles: [
        {
          width: 256,
          height: 256,
          scaleFactors: [1, 2, 4, 8, 16, 32],
        },
      ],
      sizes: [
        {
          width: 798,
          height: 1024,
        },
        {
          width: 312,
          height: 400,
        },
        {
          width: 156,
          height: 200,
        },
        {
          width: 78,
          height: 100,
        },
      ],
      profile: [
        "http://iiif.io/api/image/2/level1.json",
        {
          formats: ["jpg"],
          qualities: ["native", "color", "gray"],
          supports: [
            "regionByPct",
            "sizeByForcedWh",
            "sizeByWh",
            "sizeAboveFull",
            "rotationBy90s",
            "mirroring",
            "gray",
          ],
        },
      ],
    },
  };
});
