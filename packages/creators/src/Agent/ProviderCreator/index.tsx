import { defineCreator } from "@manifest-editor/creator-api";

export const providerCreator = defineCreator({
  id: "@manifest-editor/provider",
  label: "Provider",
  summary: "Create a new provider",
  resourceType: "Agent",
  resourceFields: ["id", "type", "label"],
  supports: {
    parentTypes: ["Manifest", "Collection"],
    parentFields: ["provider"],
  },
  create: () => ({
    ...getEmptyType("Agent"),
    id: "",
    type: "Agent",
    label: { en: ["New provider"] },
  }),
});
