import { CreatorDefinition } from "@manifest-editor/creator-api";
import { createFromManifestBrowserOutput } from "./manifest-browser-creator";
import ManifestBrowserCreatorForm from "./manifest-browser-form.lazy";
import { IIIFBrowserIcon } from "@manifest-editor/components";

export const manifestBrowserCreator: CreatorDefinition = {
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
};
