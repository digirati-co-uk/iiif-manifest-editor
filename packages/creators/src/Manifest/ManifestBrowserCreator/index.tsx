import { IIIFBrowserIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { createFromManifestBrowserOutput } from "./manifest-browser-creator";
import ManifestBrowserCreatorForm from "./manifest-browser-form.lazy";

export type { ManifestBrowserCreatorPayload } from "./manifest-browser-creator";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/manifest-browser-creator": typeof manifestBrowserCreator;
    }
  }
}

export const manifestBrowserCreator = defineCreator({
  id: "@manifest-editor/manifest-browser-creator",
  create: createFromManifestBrowserOutput,
  label: "IIIF Browser",
  summary: "Browse IIIF Resources",
  icon: <IIIFBrowserIcon />,
  render(ctx: any) {
    return <ManifestBrowserCreatorForm {...ctx} />;
  },
  resourceType: "Manifest",
  resourceFields: ["id", "label"],
  additionalTypes: ["Collection"],
  supports: {
    parentTypes: ["Collection"],
    parentFieldMap: {
      Collection: ["items"],
    },
  },
  sideEffects: [],
  staticFields: {},
});
