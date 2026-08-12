import type { EditorDefinition } from "@manifest-editor/shell";
import { ActivationStateEditor } from "./ActivationStateEditor";

export const activationStateEditor: EditorDefinition = {
  id: "@manifest-editor/activation-state-editor",
  label: "Activation state",
  supports: {
    edit: true,
    properties: ["action", "transform", "selector", "source"],
    resourceTypes: ["ContentResource"],
    readOnlyProperties: [],
    custom: (resource, vault) => {
      const state = vault.get<any>(resource.resource.source, {
        preserveSpecificResources: true,
        skipSelfReturn: false,
      });
      return state?.type === "SpecificResource" && state.source?.type === "Annotation" && state.action != null;
    },
  },
  component: () => <ActivationStateEditor />,
};
