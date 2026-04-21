import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  collectDetectedManifestLanguages,
  collectTranslationLanguageProgress,
  collectTranslationTargets,
} from "./collection";
import type { TranslationRunOptions } from "./types";

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

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestRef.id,
    type: "Manifest",
    label: { en: ["Shared title"] },
    summary: { en: ["Manifest summary"] },
    metadata: [
      {
        label: { en: ["Creator"] },
        value: { en: ["Alice Example"] },
      },
    ],
    requiredStatement: {
      label: { en: ["Attribution"] },
      value: { en: ["Provided by Example Library"] },
    },
    provider: [
      {
        id: "https://example.org/agent",
        type: "Agent",
        label: { en: ["Example Library"] },
      },
    ],
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Shared title"] },
        summary: { en: ["Canvas summary"] },
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
                  value: "Annotation text",
                },
                target: "https://example.org/canvas/1",
              },
            ],
          },
        ],
      },
    ],
    structures: [
      {
        id: "https://example.org/range/1",
        type: "Range",
        label: { en: ["Range label"] },
        items: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
      },
    ],
  });
  return vault;
}

function createChoiceBodyVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestRef.id,
    type: "Manifest",
    label: { en: ["Manifest"] },
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

describe("translation string collection", () => {
  test("collects core manifest strings and deduplicates repeated source text", () => {
    const targets = collectTranslationTargets(
      createVault(),
      manifestRef,
      options,
    );
    const sources = targets.map((target) => target.sourceText);

    expect(sources).toEqual(
      expect.arrayContaining([
        "Shared title",
        "Manifest summary",
        "Creator",
        "Alice Example",
        "Attribution",
        "Provided by Example Library",
        "Example Library",
        "Canvas summary",
        "Range label",
        "Annotation text",
      ]),
    );

    const sharedTitle = targets.find(
      (target) => target.sourceText === "Shared title",
    );
    expect(sharedTitle?.occurrences).toHaveLength(2);
    expect(
      sharedTitle?.occurrences.map((occurrence) => occurrence.propertyLabel),
    ).toEqual(["Label", "Label"]);

    const textualBody = targets.find(
      (target) => target.sourceText === "Annotation text",
    );
    expect(textualBody?.occurrences[0]?.path.kind).toBe("textual-body");
  });

  test("marks targets existing when the selected target language has content", () => {
    const vault = createVault();
    vault.modifyEntityField(manifestRef as any, "summary", {
      en: ["Manifest summary"],
      nl: ["nl summary"],
    });

    const targets = collectTranslationTargets(vault, manifestRef, options);
    expect(
      targets.find((target) => target.sourceText === "Manifest summary")
        ?.status,
    ).toBe("existing");
  });

  test("detects supported IIIF languages in the manifest", () => {
    const vault = createVault();
    vault.modifyEntityField(manifestRef as any, "summary", {
      "en-GB": ["Manifest summary"],
      nl: ["Manifest samenvatting"],
      none: ["No language"],
      zz: ["Unsupported language"],
    });

    const languages = collectDetectedManifestLanguages(vault, manifestRef);

    expect(languages.map((language) => language.language)).toEqual([
      "en",
      "nl",
      "none",
    ]);
    expect(
      languages.find((language) => language.language === "en")?.iiifLanguages,
    ).toContain("en-gb");
    expect(
      languages.find((language) => language.language === "none")?.iiifLanguages,
    ).toContain("none");
  });

  test("can use IIIF none values as the source text", () => {
    const vault = createVault();
    vault.modifyEntityField(manifestRef as any, "summary", {
      none: ["No language"],
    });

    const targets = collectTranslationTargets(vault, manifestRef, {
      ...options,
      sourceLanguage: "none",
      targetLanguage: "ja",
    });
    const target = targets.find((item) => item.sourceText === "No language");

    expect(target?.sourceLanguage).toBe("none");
    expect(target?.occurrences[0]?.sourceMapLanguage).toBe("none");
  });

  test("reports target-language progress for detected languages", () => {
    const vault = createVault();
    vault.modifyEntityField(manifestRef as any, "label", {
      en: ["Shared title"],
      nl: ["Gedeelde titel"],
    });
    vault.modifyEntityField(
      { id: "https://example.org/canvas/1", type: "Canvas" } as any,
      "label",
      {
        en: ["Shared title"],
        nl: ["Gedeelde titel"],
      },
    );

    const progress = collectTranslationLanguageProgress(
      vault,
      manifestRef,
      options,
      ["en", "nl"],
    );
    const english = progress.find((item) => item.language === "en");
    const dutch = progress.find((item) => item.language === "nl");

    expect(english?.existing).toBe(english?.total);
    expect(dutch?.existing).toBe(1);
    expect(dutch?.missing).toBe((dutch?.total || 0) - 1);
  });

  test("can hide annotation bodies and canvas labels from target collection", () => {
    const vault = createVault();
    vault.modifyEntityField(
      { id: "https://example.org/canvas/1", type: "Canvas" } as any,
      "label",
      { en: ["Canvas-only label"] },
    );

    const targets = collectTranslationTargets(vault, manifestRef, {
      ...options,
      contentFilters: {
        annotationBodies: false,
        canvasLabels: false,
      },
    });
    const sources = targets.map((target) => target.sourceText);

    expect(sources).not.toContain("Annotation text");
    expect(sources).not.toContain("Canvas-only label");
  });

  test("can collect strings from a canvas root without manifest-level strings", () => {
    const targets = collectTranslationTargets(
      createVault(),
      { id: "https://example.org/canvas/1", type: "Canvas" },
      options,
    );
    const sources = targets.map((target) => target.sourceText);

    expect(sources).toEqual(expect.arrayContaining(["Shared title", "Canvas summary", "Annotation text"]));
    expect(sources).not.toContain("Manifest summary");
    expect(sources).not.toContain("Range label");
    expect(sources).not.toContain("Example Library");
  });

  test("treats Choice textual bodies as multilingual annotation body alternatives", () => {
    const vault = createChoiceBodyVault();
    const targets = collectTranslationTargets(vault, manifestRef, {
      ...options,
      targetLanguage: "ja",
    });
    const target = targets.find(
      (item) => item.sourceText === "Koto with a cover being carried",
    );

    expect(target?.status).toBe("existing");
    expect(target?.occurrences[0]?.targetText).toBe("袋に収められた琴");
  });
});
