import type { ManifestEditorSpecification } from "@manifest-editor/shell";

export const exampleSpecificationId = "example-iiif-publication";

export const exampleManifestSpecification: ManifestEditorSpecification = {
  id: exampleSpecificationId,
  label: "Example IIIF publication specification",
  description:
    "Demonstrates Manifest Editor specification rules, terminology, fixed values, and IIIF-specific checks.",
  version: "1.0.0",
  terminology: {
    entities: {
      Manifest: "Publication",
      Canvas: "Page",
    },
    properties: [
      {
        entityType: "Manifest",
        path: ["label"],
        label: "Publication title",
      },
      {
        entityType: "Manifest",
        path: ["summary"],
        label: "Public description",
      },
      {
        entityType: "Manifest",
        path: ["rights"],
        label: "Reuse licence",
      },
      {
        entityType: "Manifest",
        path: ["requiredStatement"],
        label: "Attribution statement",
      },
      {
        entityType: "Canvas",
        path: ["label"],
        label: "Page title",
      },
      {
        entityType: "Canvas",
        path: ["thumbnail"],
        label: "Page thumbnail",
      },
    ],
  },
  rules: [
    {
      id: "manifest-provider-hidden",
      type: "disallow-property",
      entityType: "Manifest",
      path: ["provider"],
      label: "Provider is managed elsewhere",
      message:
        "This example assumes provider data is supplied by a publishing system, so the Manifest provider field should not be filled in.",
    },
    {
      id: "manifest-summary-required",
      type: "require-non-empty",
      entityType: "Manifest",
      path: ["summary"],
      label: "Public description",
    },
    {
      id: "manifest-items-required",
      type: "require-non-empty",
      entityType: "Manifest",
      path: ["items"],
      label: "At least one page",
    },
    {
      id: "canvas-label-required",
      type: "require-non-empty",
      entityType: "Canvas",
      path: ["label"],
      label: "Page titles",
    },
    {
      id: "rights-fixed",
      type: "fixed-value",
      entityType: "Manifest",
      path: ["rights"],
      label: "Reuse licence",
      value: "http://creativecommons.org/publicdomain/mark/1.0/",
      message: "This example requires the Public Domain Mark rights URI.",
    },
    {
      id: "contains-image-service",
      type: "iiif:canvas-with-image-service",
      label: "At least one IIIF Image API canvas",
      message:
        "The publication must contain at least one canvas with painting content backed by an image service.",
    },
    {
      id: "thumbnail-from-body-service",
      type: "iiif:thumbnail-from-body-service",
      entityType: "Canvas",
      label: "Page thumbnails use the image service",
    },
    {
      id: "rights-valid",
      type: "iiif:valid-rights",
      label: "Allowed reuse licence",
      allowed: [
        "http://creativecommons.org/publicdomain/mark/1.0/",
        "https://creativecommons.org/publicdomain/zero/1.0/",
      ],
      required: true,
    },
    {
      id: "required-statement-attribution",
      type: "iiif:required-statement",
      label: "Attribution statement",
      valueRequired: true,
    },
    {
      id: "metadata-template",
      type: "iiif:metadata-template",
      label: "Publication metadata template",
      items: [
        {
          label: { en: ["Creator"] },
          valueRequired: true,
        },
        {
          label: { en: ["Date"] },
          valueRequired: false,
        },
        {
          label: { en: ["Holding institution"] },
          valueRequired: true,
        },
      ],
    },
  ],
};

export const exampleSpecificationOptions = [
  {
    id: "none",
    label: "No specification",
    specifications: [],
  },
  {
    id: exampleSpecificationId,
    label: "Example specification",
    specifications: [exampleManifestSpecification],
  },
] as const;

export type ExampleSpecificationOptionId =
  (typeof exampleSpecificationOptions)[number]["id"];

export function getExampleSpecificationOption(id: string | null | undefined) {
  if (id === "none" || id === null) {
    return exampleSpecificationOptions[0];
  }

  return (
    exampleSpecificationOptions.find((option) => option.id === id) ||
    exampleSpecificationOptions[1]
  );
}
