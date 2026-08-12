import type { Vault4 } from "@iiif/helpers/vault-4";
import { ActionButton, DeleteIcon, IconButton, PaddedSidebarContainer, ResetIcon } from "@manifest-editor/components";
import { useEditor, useLayoutActions } from "@manifest-editor/shell";
import { useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault/presentation-4";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { sceneActivationEditing, useSceneActivationEditing } from "../../helpers/scene-activation-editing";
import { getSceneActivations, getSceneModels, removeActivationState } from "../../helpers/scene-activations";
import { describeSceneAnnotation } from "../../helpers/scene-items";
import {
  getTransformVector,
  setTransformAxis,
  setTransformVector,
  type ModelTransform,
  type TransformAxis,
  type TransformType,
} from "../../helpers/model-transforms";

const transformFields: Array<{ label: string; type: TransformType; step: number }> = [
  { label: "Position", type: "TranslateTransform", step: 0.1 },
  { label: "Rotation", type: "RotateTransform", step: 1 },
  { label: "Scale", type: "ScaleTransform", step: 0.1 },
];

const asArray = <T,>(value: T | readonly T[] | null | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? [...value] : [value as T];

export function ActivationStateEditor() {
  const editor = useEditor();
  const ref = editor.ref();
  const vault = useVault() as unknown as Vault4;
  const layout = useLayoutActions();
  const editing = useSceneActivationEditing();
  const [uniformScale, setUniformScale] = useState(true);
  const state = useVaultSelector(
    (_, currentVault) =>
      currentVault.get<any>(ref as any, {
        preserveSpecificResources: true,
        skipSelfReturn: false,
      }),
    [ref.id]
  );
  const source = useVaultSelector(
    (_, currentVault) => (state?.source ? currentVault.get<any>(state.source, { skipSelfReturn: false }) : undefined),
    [state?.source?.id]
  );
  const modelLabel = source ? describeSceneAnnotation(source, vault).label : "Model";
  const actions = asArray<string>(state?.action);
  const transforms = asArray<ModelTransform>(state?.transform);
  const restActions = editing
    ? getSceneModels({ id: editing.sceneId, type: "Scene" }, vault).find(
        (model) => model.annotation.id === state?.source?.id
      )?.restActions || ["show", "enable"]
    : ["show", "enable"];

  const setAction = (group: string[], value: string, restAction: string) => {
    vault.modifyEntityField(ref as any, "action", [
      ...actions.filter((action) => !group.includes(action)),
      value || restAction,
    ]);
  };
  const visibility = actions.filter((action) => action === "show" || action === "hide").at(-1);
  const restVisibility = restActions.includes("hide") ? "hide" : "show";
  const availability = actions.filter((action) => action === "enable" || action === "disable").at(-1);
  const restAvailability = restActions.includes("disable") ? "disable" : "enable";
  const activation = editing
    ? getSceneActivations({ id: editing.sceneId, type: "Scene" }, vault).find(
        (candidate) => candidate.id === editing.activationId
      )
    : undefined;
  const updateTransform = (type: TransformType, axis: TransformAxis, value: number) => {
    if (!Number.isFinite(value)) return;
    const next =
      type === "ScaleTransform" && uniformScale
        ? setTransformVector(transforms, type, { x: value, y: value, z: value })
        : setTransformAxis(transforms, type, axis, value);
    vault.modifyEntityField(ref as any, "transform", next);
  };

  return (
    <PaddedSidebarContainer>
      <InputContainer $wide>
        <InputLabel>Model</InputLabel>
        <Input disabled value={modelLabel} />
      </InputContainer>
      <InputContainer $wide>
        <InputLabel htmlFor="activation-visibility">Visibility</InputLabel>
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          id="activation-visibility"
          value={visibility === restVisibility ? "" : visibility || ""}
          onChange={(event) => setAction(["show", "hide"], event.target.value, restVisibility)}
        >
          <option value="">No change</option>
          <option value="show">Show</option>
          <option value="hide">Hide</option>
        </select>
      </InputContainer>
      <InputContainer $wide>
        <InputLabel htmlFor="activation-availability">Availability</InputLabel>
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          id="activation-availability"
          value={availability === restAvailability ? "" : availability || ""}
          onChange={(event) => setAction(["enable", "disable"], event.target.value, restAvailability)}
        >
          <option value="">No change</option>
          <option value="enable">Enable</option>
          <option value="disable">Disable</option>
        </select>
      </InputContainer>
      {transformFields.map(({ label, type, step }) => {
        const value = getTransformVector(transforms, type);
        return (
          <InputContainer $wide key={type}>
            <div className="flex items-center justify-between">
              <InputLabel>{label}</InputLabel>
              <IconButton
                label={`Reset ${label.toLowerCase()}`}
                className="text-base text-gray-500"
                onPress={() =>
                  vault.modifyEntityField(
                    ref as any,
                    "transform",
                    transforms.filter((transform) => transform.type !== type)
                  )
                }
              >
                <ResetIcon />
              </IconButton>
            </div>
            <div className="flex gap-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <label className="flex-1 text-xs uppercase" key={axis}>
                  {axis}
                  <Input
                    aria-label={`${label} ${axis}`}
                    type="number"
                    step={step}
                    value={value[axis]}
                    onChange={(event) => updateTransform(type, axis, event.target.valueAsNumber)}
                  />
                </label>
              ))}
            </div>
            {type === "ScaleTransform" ? (
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={uniformScale}
                  onChange={(event) => setUniformScale(event.target.checked)}
                />
                Uniform scale
              </label>
            ) : null}
          </InputContainer>
        );
      })}
      <div className="mt-3 border-t border-gray-200 pt-3">
        <ActionButton
          isDisabled={!activation || activation.states.length <= 1}
          onPress={() => {
            if (!editing || !window.confirm(`Remove ${modelLabel} from this activation?`)) return;
            if (!activation) return;
            removeActivationState(activation, ref.id, vault);
            sceneActivationEditing.selectModel(null);
            layout.rightPanel.close();
          }}
        >
          <DeleteIcon className="text-base" />
          Remove from activation
        </ActionButton>
      </div>
    </PaddedSidebarContainer>
  );
}
