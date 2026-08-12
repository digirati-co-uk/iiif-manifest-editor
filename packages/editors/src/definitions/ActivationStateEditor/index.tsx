import type { EditorDefinition } from "@manifest-editor/shell";
import { sceneActivationEditing } from "../../helpers/scene-activation-editing";
import { getSceneActivations } from "../../helpers/scene-activations";
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
      const editing = sceneActivationEditing.getSnapshot();
      if (!editing) return false;
      const state = vault.get<any>(resource.resource.source, {
        preserveSpecificResources: true,
        skipSelfReturn: false,
      });
      return (
        state?.type === "SpecificResource" &&
        getSceneActivations({ id: editing.sceneId, type: "Scene" }, vault as any)
          .find((activation) => activation.id === editing.activationId)
          ?.states.some((candidate) => candidate.id === state.id) === true
      );
    },
  },
  component: () => <ActivationStateEditor />,
};
