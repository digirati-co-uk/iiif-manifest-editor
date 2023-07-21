import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import ManifestBrowserCreatorForm from "@/_creators/Manifest/ManifestBrowserCreator/manifest-browser-form.lazy";
import { createFromManifestBrowserOutput } from "@/_creators/Manifest/ManifestBrowserCreator/manifest-browser-creator";

export const manifestBrowserCreator: CreatorDefinition = {
  id: "@manifest-editor/manifest-browser-creator",
  create: createFromManifestBrowserOutput,
  label: "IIIF Browser",
  summary: "Find a resource within a IIIF Collection",
  icon: <img src={textFormatIcon} alt="" />,
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
