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
  labelMessage: { namespace: "editor-api", key: "fields.provider" },
  icon: (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m3 9 9-6 9 6H3ZM3 21h18M5 10v8m5-8v8m4-8v8m5-8v8" />
    </svg>
  ),
  summary: "Add the organisation responsible for providing this resource.",
  summaryMessage: { namespace: "creators", key: "definitions.provider.summary" },
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
