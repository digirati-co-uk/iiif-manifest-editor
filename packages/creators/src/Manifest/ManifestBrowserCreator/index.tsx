import { CreatorDefinition } from "@manifest-editor/creator-api";
import { createFromManifestBrowserOutput } from "./manifest-browser-creator";
import ManifestBrowserCreatorForm from "./manifest-browser-form.lazy";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";

export const manifestBrowserCreator: CreatorDefinition = {
  id: "@manifest-editor/manifest-browser-creator",
  create: createFromManifestBrowserOutput,
  label: "IIIF Browser",
  summary: "Find a resource within a IIIF Collection",
  icon: <TextFormatIcon />,
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
