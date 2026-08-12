import type { Vault4 } from "@iiif/helpers/vault-4";
import { ActionButton, AddIcon, BackIcon, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useEffect, useMemo, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault/presentation-4";
import { useInStack } from "../../helpers";
import { sceneActivationEditing, useSceneActivationEditing } from "../../helpers/scene-activation-editing";
import {
  addModelsToSceneActivation,
  createSceneActivation,
  duplicateSceneActivation,
  getSceneActivations,
  getSceneModels,
  removeActivationState,
  removeSceneActivation,
  reorderActivationStates,
  reorderSceneActivations,
  type SceneActivation,
  type SceneActivationState,
} from "../../helpers/scene-activations";
import { ReorderList } from "../ReorderList/ReorderList.dndkit";

export function SceneActivations() {
  const scene = useInStack("Scene");
  const sceneRef = scene?.resource.source as any;
  const vault = useVault() as unknown as Vault4;
  const layout = useLayoutActions();
  const editing = useSceneActivationEditing();
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [creationMode, setCreationMode] = useState<"all" | "selected">("all");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [changedOnly, setChangedOnly] = useState(false);
  const [addingModels, setAddingModels] = useState(false);
  const [modelsToAdd, setModelsToAdd] = useState<string[]>([]);
  const resolved = useVaultSelector(
    (_, currentVault) => {
      if (!sceneRef) return { activations: [] as SceneActivation[], models: [] as ReturnType<typeof getSceneModels> };
      return {
        activations: getSceneActivations(sceneRef, currentVault as unknown as Vault4),
        models: getSceneModels(sceneRef, currentVault as unknown as Vault4),
      };
    },
    [sceneRef?.id]
  );
  const activationId = editing && editing.sceneId === sceneRef?.id ? editing.activationId : undefined;
  const activation = resolved.activations.find((candidate) => candidate.id === activationId);
  const missingModels = useMemo(() => {
    const included = new Set(activation?.states.map((state) => state.source.id));
    return resolved.models.filter((model) => !included.has(model.annotation.id));
  }, [activation?.states, resolved.models]);

  useEffect(() => () => sceneActivationEditing.clear(sceneRef?.id), [sceneRef?.id]);

  const openActivation = (next: SceneActivation) => {
    setCreating(false);
    setChangedOnly(false);
    setAddingModels(false);
    sceneActivationEditing.select(sceneRef.id, next.id);
  };
  const openState = (state: SceneActivationState, index: number) => {
    if (!activation) return;
    sceneActivationEditing.selectModel(state.source.id);
    layout.edit(
      state.ref as any,
      {
        parent: { id: activation.body.id, type: "ContentResource" } as any,
        property: activation.body.type === "List" ? "items" : "body",
        index,
      },
      { forceOpen: true }
    );
  };
  const resetCreate = () => {
    setCreating(false);
    setLabel("");
    setSelectedModels([]);
    setCreationMode("all");
  };

  if (!sceneRef) return <EmptyState>Select a Scene to manage activations</EmptyState>;

  if (activation) {
    const visibleStates = changedOnly ? activation.states.filter((state) => state.changed) : activation.states;
    const changedCount = activation.states.filter((state) => state.changed).length;
    return (
      <Sidebar>
        <SidebarHeader
          title={activation.label}
          actions={[
            {
              icon: <BackIcon />,
              title: "Back to activations",
              onClick: () => {
                sceneActivationEditing.clear(sceneRef.id);
                layout.rightPanel.close();
              },
            },
            {
              icon: <AddIcon />,
              title: "Add models",
              disabled: missingModels.length === 0,
              toggled: addingModels,
              onClick: () => setAddingModels((value) => !value),
            },
          ]}
        />
        <SidebarContent className="pb-0">
          <div className="border-b border-gray-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {changedCount} of {activation.states.length} model{activation.states.length === 1 ? "" : "s"} changed
              </p>
              <label className="flex shrink-0 items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={changedOnly}
                  onChange={(event) => setChangedOnly(event.target.checked)}
                />
                Changed only
              </label>
            </div>
          </div>
          {addingModels ? (
            <section className="border-b border-gray-200 bg-gray-50 p-3" aria-label="Add models">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Add models</h2>
              <ModelChoices models={missingModels} selected={modelsToAdd} onChange={setModelsToAdd} />
              <div className="mt-3 flex gap-2">
                <ActionButton
                  primary
                  isDisabled={!modelsToAdd.length}
                  onPress={() => {
                    addModelsToSceneActivation(
                      activation,
                      missingModels
                        .filter((model) => modelsToAdd.includes(model.annotation.id))
                        .map((model) => ({ id: model.annotation.id, type: "Annotation" })),
                      vault
                    );
                    setModelsToAdd([]);
                    setAddingModels(false);
                  }}
                >
                  Add selected
                </ActionButton>
                <ActionButton onPress={() => setAddingModels(false)}>Cancel</ActionButton>
              </div>
            </section>
          ) : null}
          {visibleStates.length ? (
            changedOnly ? (
              <ul aria-label="Changed activation states">
                {visibleStates.map((state) => (
                  <StateRow
                    key={state.id}
                    state={state}
                    selected={editing?.modelAnnotationId === state.source.id}
                    onOpen={() => openState(state, activation.states.findIndex((item) => item.id === state.id))}
                    onRemove={() => {
                      if (!window.confirm(`Remove ${state.label} from this activation?`)) return;
                      removeActivationState(activation, state.id, vault);
                    }}
                  />
                ))}
              </ul>
            ) : (
              <ReorderList
                id={`${activation.id}-states`}
                items={activation.states}
                inlineHandle={false}
                list
                reorder={({ startIndex, endIndex }) =>
                  reorderActivationStates(activation, startIndex, endIndex, vault)
                }
                renderItem={(state, index) => (
                  <StateRow
                    state={state}
                    selected={editing?.modelAnnotationId === state.source.id}
                    onOpen={() => openState(state, index)}
                    onRemove={() => {
                      if (!window.confirm(`Remove ${state.label} from this activation?`)) return;
                      removeActivationState(activation, state.id, vault);
                    }}
                  />
                )}
              />
            )
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              {changedOnly ? "No models differ from their rest state." : "This activation has no models."}
            </div>
          )}
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader
        title="Activations"
        actions={[
          {
            icon: <AddIcon />,
            title: "Create activation",
            toggled: creating,
            disabled: !resolved.models.length,
            onClick: () => setCreating((value) => !value),
          },
        ]}
      />
      <SidebarContent className="pb-0">
        {creating ? (
          <section className="border-b border-gray-200 bg-gray-50 p-3" aria-label="Create activation">
            <label className="block text-sm font-medium text-gray-900">
              Name
              <input
                className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </label>
            <fieldset className="mt-3">
              <legend className="text-sm font-medium text-gray-900">Models to change</legend>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="activation-models"
                  checked={creationMode === "all"}
                  onChange={() => setCreationMode("all")}
                />
                All models
              </label>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="activation-models"
                  checked={creationMode === "selected"}
                  onChange={() => setCreationMode("selected")}
                />
                Selected models
              </label>
            </fieldset>
            {creationMode === "selected" ? (
              <div className="mt-2 max-h-56 overflow-auto rounded border border-gray-200 bg-white p-2">
                <ModelChoices models={resolved.models} selected={selectedModels} onChange={setSelectedModels} />
              </div>
            ) : null}
            <div className="mt-3 flex gap-2">
              <ActionButton
                primary
                isDisabled={!label.trim() || (creationMode === "selected" && !selectedModels.length)}
                onPress={() => {
                  const chosen =
                    creationMode === "all"
                      ? resolved.models
                      : resolved.models.filter((model) => selectedModels.includes(model.annotation.id));
                  const id = createSceneActivation(
                    sceneRef,
                    label.trim(),
                    chosen.map((model) => ({ id: model.annotation.id, type: "Annotation" })),
                    vault
                  );
                  resetCreate();
                  sceneActivationEditing.select(sceneRef.id, id);
                }}
              >
                Create activation
              </ActionButton>
              <ActionButton onPress={resetCreate}>Cancel</ActionButton>
            </div>
          </section>
        ) : null}
        {resolved.activations.length ? (
          <ReorderList
            id={`${sceneRef.id}-activations`}
            items={resolved.activations}
            inlineHandle={false}
            list
            reorder={({ startIndex, endIndex }) =>
              reorderSceneActivations(resolved.activations, startIndex, endIndex, vault)
            }
            createActions={(item) => [
              {
                label: "Duplicate",
                onClick: () => {
                  const id = duplicateSceneActivation(sceneRef, item, vault);
                  sceneActivationEditing.select(sceneRef.id, id);
                },
              },
              {
                label: "Delete",
                onClick: () => {
                  if (!window.confirm(`Delete activation “${item.label}”?`)) return;
                  removeSceneActivation(item, vault);
                },
              },
            ]}
            renderItem={(item) => {
              const changed = item.states.filter((state) => state.changed).length;
              return (
                <button
                  className="min-w-0 flex-1 px-3 py-2 text-left hover:bg-gray-50"
                  type="button"
                  onClick={() => openActivation(item)}
                >
                  <span className="block truncate text-sm text-gray-900">{item.label}</span>
                  <span className="block text-xs text-gray-500">
                    {changed} changed · {item.states.length} model{item.states.length === 1 ? "" : "s"}
                  </span>
                </button>
              );
            }}
          />
        ) : !creating ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            <p>This Scene has no activations.</p>
            <ActionButton large primary isDisabled={!resolved.models.length} onPress={() => setCreating(true)}>
              <AddIcon className="text-xl" />
              Create activation
            </ActionButton>
          </div>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}

function ModelChoices({
  models,
  selected,
  onChange,
}: {
  models: Array<{ annotation: { id: string }; label: string }>;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {models.map((model) => (
        <label className="flex items-center gap-2 py-1 text-sm" key={model.annotation.id}>
          <input
            type="checkbox"
            checked={selected.includes(model.annotation.id)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...selected, model.annotation.id]
                  : selected.filter((id) => id !== model.annotation.id)
              )
            }
          />
          <span className="truncate">{model.label}</span>
        </label>
      ))}
    </div>
  );
}

function StateRow({
  state,
  selected,
  onOpen,
  onRemove,
}: {
  state: SceneActivationState;
  selected: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex min-w-0 items-center border-l-2 border-b border-gray-200 ${
        selected ? "border-l-me-600 bg-gray-100" : "border-l-transparent"
      }`}
    >
      <button className="min-w-0 flex-1 px-3 py-2 text-left hover:bg-gray-50" type="button" onClick={onOpen}>
        <span className="block truncate text-sm text-gray-900">{state.label}</span>
        <span className={`block text-xs ${state.changed ? "font-medium text-amber-700" : "text-gray-500"}`}>
          {state.changed ? "Changed from rest" : "Same as rest"}
        </span>
      </button>
      <button
        aria-label={`Remove ${state.label}`}
        className="mr-1 flex h-7 w-7 items-center justify-center rounded text-lg text-gray-500 hover:bg-red-50 hover:text-red-700"
        title="Remove from activation"
        type="button"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}
