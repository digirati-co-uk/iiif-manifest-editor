import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import { collectTranslationTargets } from "./collection";
import type { TranslationRunOptions } from "./types";
import {
  getWritableOccurrences,
  writeTranslationForOccurrence,
} from "./writeback";

const manifestRef = {
  id: "https://example.org/manifest",
  type: "Manifest",
} as const;

const options: TranslationRunOptions = {
  sourceLanguage: "en",
  targetLanguage: "nl",
  runtime: "wasm",
  writePolicy: "fill-missing",
  contentFilters: {
    annotationBodies: true,
    canvasLabels: true,
  },
};

function createVault(overrides: Record<string, unknown> = {}) {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestRef.id,
    type: "Manifest",
    label: { en: ["Hello"] },
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Canvas"] },
        width: 1000,
        height: 1000,
        items: [
          {
            id: "https://example.org/canvas/1/page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/canvas/1/annotation",
                type: "Annotation",
                motivation: "supplementing",
                body: {
                  id: "https://example.org/canvas/1/body/en",
                  type: "TextualBody",
                  format: "text/plain",
                  language: "en",
                  value: "Body text",
                },
                target: "https://example.org/canvas/1",
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  });
  return vault;
}

function createChoiceBodyVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestRef.id,
    type: "Manifest",
    label: { en: ["Hello"] },
    items: [
      {
        id: "https://example.org/canvas/choice",
        type: "Canvas",
        label: { en: ["Choice canvas"] },
        width: 1000,
        height: 1000,
        items: [
          {
            id: "https://example.org/canvas/choice/page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/canvas/choice/annotation",
                type: "Annotation",
                motivation: "supplementing",
                body: {
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
                target: "https://example.org/canvas/choice",
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

describe("translation write-back", () => {
  test("writes missing language-map values without disturbing source values", () => {
    const vault = createVault();
    const target = collectTranslationTargets(vault, manifestRef, options).find(
      (item) => item.sourceText === "Hello",
    );
    expect(target).toBeDefined();

    writeTranslationForOccurrence(
      { vault },
      target!.occurrences[0]!,
      "nl value",
    );

    expect((vault.get(manifestRef as any) as any).label).toEqual({
      en: ["Hello"],
      nl: ["nl value"],
    });
  });

  test("treats any populated target-language array as existing for fill-missing", () => {
    const vault = createVault({
      label: { en: ["One", "Two"], uk: ["Один"] },
    });
    const target = collectTranslationTargets(vault, manifestRef, {
      ...options,
      sourceLanguage: "en",
      targetLanguage: "uk",
    }).find((item) => item.sourceText === "Two");
    expect(target?.status).toBe("existing");

    const writable = getWritableOccurrences({ vault }, target!);
    expect(writable.writable).toHaveLength(0);
    expect(writable.existing).toHaveLength(1);
  });

  test("appends target-language textual bodies", () => {
    const vault = createVault();
    const target = collectTranslationTargets(vault, manifestRef, options).find(
      (item) => item.sourceText === "Body text",
    );
    expect(target?.occurrences[0]?.path.kind).toBe("textual-body");

    writeTranslationForOccurrence(
      { vault },
      target!.occurrences[0]!,
      "nl value",
    );

    const annotation = vault.get({
      id: "https://example.org/canvas/1/annotation",
      type: "Annotation",
    } as any) as any;
    expect(annotation.body).toHaveLength(2);
    const translatedBody = vault.get(annotation.body[1]) as any;
    expect(translatedBody).toMatchObject({
      type: "TextualBody",
      language: "nl",
      value: "nl value",
    });
  });

  test("appends missing translations to Choice textual body items", () => {
    const vault = createChoiceBodyVault();
    const target = collectTranslationTargets(vault, manifestRef, options).find(
      (item) => item.sourceText === "Koto with a cover being carried",
    );
    expect(target?.occurrences[0]?.path.kind).toBe("textual-body");

    writeTranslationForOccurrence(
      { vault },
      target!.occurrences[0]!,
      "nl value",
    );

    const annotation = vault.get({
      id: "https://example.org/canvas/choice/annotation",
      type: "Annotation",
    } as any) as any;
    const choice = vault.get(annotation.body)[0] as any;
    const bodies = vault.get(choice.items) as any[];

    expect(choice.type).toBe("Choice");
    expect(bodies.map((body) => body.language)).toEqual(["en", "ja", "nl"]);
    expect(bodies[2]).toMatchObject({
      type: "TextualBody",
      language: "nl",
      value: "nl value",
    });
  });
});
