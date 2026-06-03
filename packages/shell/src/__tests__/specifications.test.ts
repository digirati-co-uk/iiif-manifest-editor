import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test } from "vitest";
import {
  evaluateSpecifications,
  getPropertyPolicy,
  getTerminologyLabel,
  hasMeaningfulValue,
  specificationJsonEquals,
} from "../SpecificationContext";
import type { ManifestEditorSpecification } from "../SpecificationContext";

const manifestRef = {
  id: "https://example.org/manifest",
  type: "Manifest",
} as const;

function createVault() {
  const vault = new Vault();
  vault.loadManifestSync(manifestRef.id, {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: manifestRef.id,
    type: "Manifest",
    label: { en: ["Test manifest"] },
    rights: "http://rightsstatements.org/vocab/InC/1.0/",
    requiredStatement: {
      label: { en: ["Attribution"] },
      value: { en: ["Example Library"] },
    },
    metadata: [
      {
        label: { en: ["Creator"] },
        value: { en: ["Alice Example"] },
      },
    ],
    provider: [
      {
        id: "https://example.org/provider",
        type: "Agent",
        label: { en: ["Example Library"] },
      },
    ],
    items: [
      {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        label: { en: ["Canvas 1"] },
        width: 1000,
        height: 1000,
        thumbnail: [
          {
            id: "https://images.example.org/iiif/1/full/120,/0/default.jpg",
            type: "Image",
            service: [
              {
                id: "https://images.example.org/iiif/1",
                type: "ImageService3",
              },
            ],
          },
        ],
        items: [
          {
            id: "https://example.org/canvas/1/page",
            type: "AnnotationPage",
            items: [
              {
                id: "https://example.org/canvas/1/annotation",
                type: "Annotation",
                motivation: "painting",
                body: {
                  id: "https://images.example.org/iiif/1/full/full/0/default.jpg",
                  type: "Image",
                  format: "image/jpeg",
                  service: [
                    {
                      id: "https://images.example.org/iiif/1",
                      type: "ImageService3",
                    },
                  ],
                },
                target: "https://example.org/canvas/1",
              },
            ],
          },
        ],
      },
    ],
  });
  return vault;
}

const specification: ManifestEditorSpecification = {
  id: "example",
  label: "Example specification",
  terminology: {
    properties: [
      {
        entityType: "Manifest",
        path: ["label"],
        label: "Title",
      },
    ],
  },
  rules: [
    {
      id: "no-provider",
      type: "disallow-property",
      entityType: "Manifest",
      path: ["provider"],
    },
    {
      id: "summary",
      type: "require-non-empty",
      entityType: "Manifest",
      path: ["summary"],
    },
    {
      id: "items",
      type: "require-non-empty",
      entityType: "Manifest",
      path: ["items"],
    },
    {
      id: "fixed-rights",
      type: "fixed-value",
      entityType: "Manifest",
      path: ["rights"],
      value: "http://creativecommons.org/publicdomain/mark/1.0/",
    },
    {
      id: "service",
      type: "iiif:canvas-with-image-service",
      serviceId: "https://images.example.org/iiif/1",
    },
    {
      id: "thumbnail",
      type: "iiif:thumbnail-from-body-service",
      entityType: "Canvas",
    },
    {
      id: "rights",
      type: "iiif:valid-rights",
      allowed: ["http://rightsstatements.org/vocab/InC/1.0/"],
    },
    {
      id: "statement",
      type: "iiif:required-statement",
      label: "Attribution",
      valueRequired: true,
    },
    {
      id: "metadata",
      type: "iiif:metadata-template",
      items: [
        {
          label: "Creator",
          valueRequired: true,
        },
        {
          label: "Date",
        },
      ],
    },
  ],
};

describe("specification helpers", () => {
  test("detects meaningful values for language maps and arrays", () => {
    expect(hasMeaningfulValue({ en: [""] })).toBe(false);
    expect(hasMeaningfulValue({ en: ["Manifest"] })).toBe(true);
    expect(hasMeaningfulValue([])).toBe(false);
    expect(hasMeaningfulValue([{ en: ["Canvas"] }])).toBe(true);
  });

  test("normalises JSON equality by object key order", () => {
    expect(
      specificationJsonEquals(
        { b: 2, a: { d: 4, c: 3 } },
        { a: { c: 3, d: 4 }, b: 2 },
      ),
    ).toBe(true);
  });

  test("returns terminology labels and property policy", () => {
    expect(
      getTerminologyLabel([specification], "Manifest", ["label"], "Label"),
    ).toBe("Title");

    const policy = getPropertyPolicy([specification], manifestRef, ["rights"]);
    expect(policy.required).toBe(true);
    expect(policy.fixedValue).toBe(
      "http://creativecommons.org/publicdomain/mark/1.0/",
    );
  });
});

describe("specification evaluation", () => {
  test("evaluates generic and IIIF-specific rules in order", () => {
    const report = evaluateSpecifications(
      [specification],
      createVault(),
      manifestRef,
    );
    const byRule = new Map(
      report.results.map((result) => [result.ruleId, result]),
    );

    expect(report.results.map((result) => result.ruleId)).toEqual([
      "no-provider",
      "summary",
      "items",
      "fixed-rights",
      "service",
      "thumbnail",
      "rights",
      "statement",
      "metadata",
      "metadata",
    ]);
    expect(byRule.get("no-provider")?.status).toBe("disallowed");
    expect(byRule.get("summary")?.status).toBe("missing");
    expect(byRule.get("items")?.status).toBe("satisfied");
    expect(byRule.get("fixed-rights")?.status).toBe("invalid");
    expect(byRule.get("service")?.status).toBe("satisfied");
    expect(byRule.get("thumbnail")?.status).toBe("satisfied");
    expect(byRule.get("rights")?.status).toBe("satisfied");
    expect(byRule.get("statement")?.status).toBe("satisfied");

    const metadataResults = report.results.filter(
      (result) => result.ruleId === "metadata",
    );
    expect(metadataResults.map((result) => result.status)).toEqual([
      "satisfied",
      "missing",
    ]);
  });
});
