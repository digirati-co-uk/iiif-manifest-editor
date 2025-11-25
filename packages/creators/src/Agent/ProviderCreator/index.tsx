import { defineCreator } from "@manifest-editor/creator-api";
import { CreateProviderForm, createProvider } from "./create-provider";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/provider": typeof createProvider;
    }
  }
}

export const providerCreator = defineCreator({
  id: "@manifest-editor/provider",
  label: "Provider",
  summary: "Create a new provider",
  resourceType: "Agent",
  resourceFields: ["id", "type", "label"],
  supports: {
    parentTypes: ["Manifest", "Collection"],
    parentFields: ["provider"],
    initialData: true,
  },
  create: createProvider,
  render(ctx) {
    return <CreateProviderForm {...ctx} />;
  },
});
