import { creatorValidationError } from "../../validation-messages";
import { IIIFBrowserIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getIIIFType, getJsonResource, isDigitalCollectionPage } from "../../resource-probes";
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
  validationErrorMessage: creatorValidationError,
  id: "@manifest-editor/manifest-browser-creator",
  configKey: "@manifest-editor/iiif-browser-creator",
  create: createFromManifestBrowserOutput,
  label: "Browse IIIF content",
  labelMessage: { namespace: "creators", key: "definitions.browser.label" },
  hideSummary: true,
  summary: "Browse IIIF manifests and collections to choose a resource to add.",
  summaryMessage: { namespace: "creators", key: "definitions.manifestBrowser.summary" },
  icon: <IIIFBrowserIcon />,
  render(ctx: any) {
    return <ManifestBrowserCreatorForm {...ctx} />;
  },
  async supportsResource(value, helpers) {
    const resource = await getJsonResource(value, helpers);
    const type = getIIIFType(resource);
    if (type === "Manifest" || type === "Collection") {
      return { initialData: { url: value } };
    }
    if (await isDigitalCollectionPage(value)) {
      return { initialData: { url: value } };
    }
    return false;
  },
  resourceType: "Manifest",
  resourceFields: ["id", "label"],
  additionalTypes: ["Collection"],
  supports: {
    initialData: true,
    parentTypes: ["Collection", "Manifest", "Canvas"],
    parentFieldMap: {
      Collection: ["items"],
      Manifest: ["partOf"],
      Canvas: ["partOf"],
    },
  },
  sideEffects: [],
  staticFields: {},
});
