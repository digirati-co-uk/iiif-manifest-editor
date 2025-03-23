import { IIIFBrowserIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import {
  type ManifestBrowserCreatorPayload,
  createFromManifestBrowserOutput,
} from "./manifest-browser-creator";
import ManifestBrowserCreatorForm from "./manifest-browser-form.lazy";

export const manifestBrowserCreator: CreatorDefinition<ManifestBrowserCreatorPayload> =
  {
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
