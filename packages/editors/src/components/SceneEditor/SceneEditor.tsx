import type { Vault4 } from "@iiif/helpers/vault-4";
import { createSceneHelper } from "@iiif/helpers/scenes";
import { EditTextIcon, InfoIcon, PreviewIcon, SceneIcon, type SceneIconName } from "@manifest-editor/components";
import { useEditingResource, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { Html } from "@react-three/drei";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault/presentation-4";
import {
  ScenePanel,
  type ScenePanelHandle,
  type SceneResourceStatus,
  type SceneView,
} from "react-iiif-vault/scene-panel";
import "react-iiif-vault/scene-panel.css";
import { useInStack } from "../../helpers";
import {
  sceneActivationTransformValueFromMatrix,
  sceneTransformValueToTransforms,
  type SceneTransformMode,
  type SceneTransformValue,
} from "../../helpers/model-transforms";
import { setAnnotationBodyTransforms } from "../../helpers/scene-annotation-body";
import { sceneAnnotationCreation, useSceneAnnotationCreation } from "../../helpers/scene-annotation-creation";
import { useSceneActivationEditing, sceneActivationEditing } from "../../helpers/scene-activation-editing";
import {
  addModelsToSceneActivation,
  findActivationState,
  getSceneActivations,
  setActivationStateTransforms,
  type SceneActivation,
} from "../../helpers/scene-activations";
import { sceneCameraRotation, sceneCameraView } from "../../helpers/scene-camera";
import { describeSceneAnnotation } from "../../helpers/scene-items";
import { SceneResourceEditor } from "./SceneResourceEditor";
import { SceneSurfacePicker } from "./SceneSurfacePicker";

const toolLabels: Record<SceneTransformMode, string> = {
  translate: "Move",
  rotate: "Rotate",
  scale: "Scale",
};

const toolIcons: Record<SceneTransformMode, SceneIconName> = {
  translate: "move",
  rotate: "rotate",
  scale: "scale",
};

export function SceneEditor() {
  const scene = useInStack("Scene");
  const current = useEditingResource();
  const vault = useVault() as unknown as Vault4;
  const layout = useLayoutActions();
  const creator = useInlineCreator();
  const panel = useRef<ScenePanelHandle>(null);
  const transformView = useRef<SceneView | null>(null);
  const initiallyFramedScene = useRef<string | null>(null);
  const activatedScene = useRef<string | null>(null);
  const sceneRef = scene?.resource.source;
  const sceneId = sceneRef?.id;
  const sceneInput = useMemo(() => (sceneId ? { id: sceneId, type: "Scene" as const } : null), [sceneId]);
  const activationEditing = useSceneActivationEditing();
  const [mode, setMode] = useState<SceneTransformMode>("translate");
  const [space, setSpace] = useState<"local" | "world">("local");
  const [snap, setSnap] = useState(false);
  const [editing, setEditing] = useState(true);
  const [statuses, setStatuses] = useState<SceneResourceStatus[]>([]);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [showLightHelpers, setShowLightHelpers] = useState(false);
  const [showCameraHelpers, setShowCameraHelpers] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewCameraId, setViewCameraId] = useState("");
  const annotationDraft = useSceneAnnotationCreation();

  const resolved = useVaultSelector(
    (_, currentVault) => {
      if (!sceneRef)
        return {
          page: undefined,
          annotations: [] as any[],
          modelAnnotations: [] as any[],
          activations: [] as SceneActivation[],
        };
      const currentScene = currentVault.get(sceneRef as any, { skipSelfReturn: false }) as any;
      const pages = (currentVault.get([...(currentScene?.items || [])], { parent: currentScene }) || []) as any[];
      const page = pages[0];
      const annotations = page ? ((currentVault.get((page as any).items || [], { parent: page }) || []) as any[]) : [];
      const modelAnnotations = pages.flatMap(
        (candidate) => (currentVault.get([...(candidate?.items || [])], { parent: candidate }) || []) as any[]
      );
      return {
        page,
        annotations,
        modelAnnotations,
        activations: getSceneActivations(sceneRef as any, currentVault as unknown as Vault4),
      };
    },
    [sceneRef?.id]
  );
  const page = resolved.page as any;
  const annotations = resolved.annotations;
  const activeActivationId =
    activationEditing && activationEditing.sceneId === sceneId ? activationEditing.activationId : undefined;
  const activeActivation = resolved.activations.find((activation) => activation.id === activeActivationId);
  const resolvedActivationId = activeActivation?.id;
  const activeActivationLabel = activeActivation?.label || "activation";
  const selectedAnnotation = activeActivation
    ? activationEditing?.modelAnnotationId || undefined
    : current?.resource.source.type === "Annotation"
      ? current.resource.source.id
      : null;
  const activationFingerprint = activeActivation
    ? JSON.stringify(
        activeActivation.states.map((state) => [state.id, state.actions, state.transforms, state.selectors])
      )
    : "";
  const sceneItems = useMemo(
    () => annotations.map((annotation, index) => describeSceneAnnotation(annotation, vault, index)),
    [annotations, vault]
  );
  const modelAnnotationIds = useMemo(
    () =>
      new Set(
        resolved.modelAnnotations
          .map((annotation, index) => describeSceneAnnotation(annotation, vault, index))
          .filter((item) => item.type === "Model")
          .map((item) => item.annotation.id)
      ),
    [resolved.modelAnnotations, vault]
  );
  const pickingAnnotationPoint = !!(annotationDraft && annotationDraft.sceneId === sceneId && !annotationDraft.point);
  const selectedAnnotationPoint = annotationDraft && annotationDraft.sceneId === sceneId ? annotationDraft.point : null;
  const selectedItem = sceneItems.find((item) => item.annotation.id === selectedAnnotation);
  const hasAuthoredLight = sceneItems.some((item) => item.group === "Lights");
  const cameras = sceneItems.filter((item) => item.group === "Cameras");
  const selectedCamera = selectedItem?.group === "Cameras" ? selectedItem : null;
  const selectedCameraAnnotationId = selectedCamera?.annotation.id || "";
  const currentCamera = selectedCamera || cameras.find((camera) => camera.resource.id === viewCameraId);

  const selectAnnotation = useCallback(
    (annotation: any | null) => {
      if (!sceneRef) return;
      if (activeActivation) {
        if (!annotation) {
          sceneActivationEditing.selectModel(null);
          layout.rightPanel.close();
          return;
        }
        let currentActivation = activeActivation;
        let stateIndex = currentActivation.states.findIndex((state) => state.source.id === annotation.id);
        let state = currentActivation.states[stateIndex];
        if (!state) {
          addModelsToSceneActivation(
            sceneRef as any,
            currentActivation,
            [{ id: annotation.id, type: "Annotation" }],
            vault
          );
          currentActivation = getSceneActivations(sceneRef as any, vault).find(
            (candidate) => candidate.id === activeActivation.id
          )!;
          stateIndex = currentActivation.states.findIndex((candidate) => candidate.source.id === annotation.id);
          state = currentActivation.states[stateIndex];
          if (!state) return;
          setMessage(`${describeSceneAnnotation(annotation, vault).label} added to ${activeActivation.label}`);
        }
        sceneActivationEditing.selectModel(annotation.id);
        layout.edit(
          state.ref as any,
          {
            parent:
              currentActivation.body.type === "List"
                ? ({ id: currentActivation.body.id, type: "ContentResource" } as any)
                : ({ id: currentActivation.id, type: "Annotation" } as any),
            property: currentActivation.body.type === "List" ? "items" : "body",
            index: stateIndex,
          },
          { forceOpen: true }
        );
        queueMicrotask(() => {
          panel.current?.reset();
          panel.current?.activate(currentActivation.id);
        });
        return;
      }
      if (!annotation) {
        layout.edit(sceneRef as any, {}, { forceOpen: true, reset: true });
        return;
      }
      const foundIndex = annotations.findIndex((item) => item.id === annotation.id);
      const index = foundIndex === -1 ? annotations.length : foundIndex;
      layout.edit(
        { id: annotation.id, type: "Annotation" } as any,
        { parent: page ? { id: page.id, type: "AnnotationPage" } : undefined, property: "items", index },
        { forceOpen: true }
      );
    },
    [activeActivation, annotations, layout, page, sceneRef, vault]
  );

  const commitTransform = useCallback(
    (value: SceneTransformValue) => {
      if (activeActivation) {
        const state = findActivationState(activeActivation, value.annotationId);
        const paintable = sceneRef
          ? createSceneHelper(vault)
              .getPaintables(vault.get<any>(sceneRef as any, { skipSelfReturn: false }))
              .items.find((candidate) => candidate.annotationId === value.annotationId)
          : undefined;
        if (!state || !paintable) {
          setMessage("This model is not part of the current activation");
          return;
        }
        const activationValue = sceneActivationTransformValueFromMatrix(
          value.annotationId,
          value.matrix,
          paintable.bodyTransform,
          value.targetPoint
        );
        setActivationStateTransforms(state, sceneTransformValueToTransforms(activationValue), vault);
        setMessage(`${toolLabels[mode]} saved to ${activeActivation.label}`);
        return;
      }
      setAnnotationBodyTransforms(
        { id: value.annotationId, type: "Annotation" },
        sceneTransformValueToTransforms(value),
        vault
      );
      setMessage(`${toolLabels[mode]} saved`);
    },
    [activeActivation, mode, sceneRef, vault]
  );

  const restoreTransformView = useCallback((finished = false) => {
    const view = transformView.current || panel.current?.getView();
    if (!view) return;
    transformView.current = view;
    queueMicrotask(() => {
      panel.current?.setView(view);
      if (finished) transformView.current = null;
    });
  }, []);

  const createDirect = useCallback(
    async (definition: string, payload: any) => {
      if (!page || !sceneRef || creating) return;
      setCreating(true);
      setMessage("");
      try {
        const result = await creator.create(definition, payload, {
          targetType: "Annotation",
          target: sceneRef as any,
          parent: { resource: { id: page.id, type: "AnnotationPage" }, property: "items" },
        });
        const created = Array.isArray(result) ? result[0] : result;
        if (created) selectAnnotation(created);
        return created;
      } catch (error: any) {
        setMessage(error?.message || "The scene item could not be created");
      } finally {
        setCreating(false);
      }
    },
    [creator, creating, page, sceneRef, selectAnnotation]
  );

  const updateCamera = useCallback(
    (cameraItem: any) => {
      const view = panel.current?.getView();
      if (!view || !cameraItem) return;
      vault.batch(() => {
        const resource = { id: cameraItem.resource.id, type: "ContentResource" } as any;
        vault.modifyEntityField(resource, "near", view.near);
        vault.modifyEntityField(resource, "far", view.far);
        vault.modifyEntityField(resource, "lookAt", {
          type: "PointSelector",
          x: view.target[0],
          y: view.target[1],
          z: view.target[2],
        });
        if (cameraItem.type === "PerspectiveCamera") {
          vault.modifyEntityField(resource, "fieldOfView", view.fieldOfView || 50);
        } else {
          vault.modifyEntityField(resource, "viewHeight", view.viewHeight || 2);
        }
        vault.modifyEntityField(
          resource,
          "transform",
          sceneTransformValueToTransforms({
            translation: view.position,
            rotation: sceneCameraRotation(view),
            scale: [1, 1, 1],
          })
        );
      });
      setMessage(`${cameraItem.label} updated from the current view`);
    },
    [vault]
  );

  const addStudioLighting = useCallback(async () => {
    const view = panel.current?.getView();
    const target = selectedAnnotation
      ? { id: selectedAnnotation, type: "Annotation" }
      : view?.target || ([0, 0, 0] as const);
    await createDirect("@manifest-editor/light-annotation", {
      type: "AmbientLight",
      label: "Ambient fill",
      color: "#ffffff",
      intensity: 0.6,
    });
    await createDirect("@manifest-editor/light-annotation", {
      type: "DirectionalLight",
      label: "Key light",
      color: "#ffffff",
      intensity: 1,
      position: view?.position || [3, 4, 5],
      lookAt: target,
    });
    setMessage("Studio lighting added");
  }, [createDirect, selectedAnnotation]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "?") setInfoOpen((value) => !value);
      if (event.key === "Escape") setInfoOpen(false);
      if (!editing) return;
      if (event.key.toLowerCase() === "w") setMode("translate");
      if (event.key.toLowerCase() === "e") setMode("rotate");
      if (event.key.toLowerCase() === "r") setMode("scale");
      if (event.key.toLowerCase() === "f") {
        if (selectedAnnotation) panel.current?.frameAnnotation(selectedAnnotation);
        else panel.current?.frameAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing, selectedAnnotation]);

  useEffect(() => {
    transformView.current = null;
  }, [selectedAnnotation]);

  useEffect(() => {
    if (!selectedCamera) return;
    const cameraId = selectedCamera.resource.id;
    setViewCameraId(cameraId);
    if (editing) {
      const view = sceneCameraView(selectedCamera, (id) => panel.current?.getAnnotationBounds(id) || null);
      if (view) panel.current?.setView(view, { transition: true });
    } else {
      panel.current?.selectCamera(cameraId);
    }
    // Switch only when the selected camera changes, not when its resolved Vault object is refreshed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, selectedCameraAnnotationId]);

  useEffect(() => {
    if (editing || selectedCameraAnnotationId) return;
    if (viewCameraId) panel.current?.selectCamera(viewCameraId);
    else {
      const view = panel.current?.getView();
      if (view) panel.current?.setView(view);
    }
  }, [editing, selectedCameraAnnotationId, viewCameraId]);

  useEffect(() => {
    if (!sceneId) return;
    queueMicrotask(() => {
      if (!panel.current) return;
      if (!resolvedActivationId) {
        if (activatedScene.current === sceneId) panel.current.reset();
        activatedScene.current = null;
        return;
      }
      panel.current.reset();
      const result = panel.current.activate(resolvedActivationId);
      activatedScene.current = sceneId;
      if (!result.ok) setMessage(result.error || `Could not apply ${activeActivationLabel}`);
    });
  }, [activationFingerprint, activeActivationLabel, resolvedActivationId, sceneId]);

  useEffect(() => {
    if (sceneRef) layout.leftPanel.open({ id: "scene-contents" });
    // Open once when entering a different Scene; the user can switch panels afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneRef?.id]);

  if (!sceneRef) return <EmptyState>No scene selected</EmptyState>;

  const selectedStatus = statuses.find((status) => status.annotationId === selectedAnnotation);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-me-gray-900">
      <SceneToolbar
        cameras={cameras}
        currentCamera={currentCamera}
        editing={editing}
        infoOpen={infoOpen}
        mode={mode}
        selectedAnnotation={selectedAnnotation}
        showCameraHelpers={showCameraHelpers}
        showLightHelpers={showLightHelpers}
        snap={snap}
        space={space}
        viewCameraId={viewCameraId}
        onCameraChange={(id: string) => {
          setViewCameraId(id);
          if (id) panel.current?.selectCamera(id);
          else {
            const view = panel.current?.getView();
            if (view) panel.current?.setView(view);
          }
        }}
        onEditingChange={(value: boolean) => {
          setEditing(value);
          setInfoOpen(false);
        }}
        onFrame={() =>
          selectedAnnotation ? panel.current?.frameAnnotation(selectedAnnotation) : panel.current?.frameAll()
        }
        onModeChange={setMode}
        onResetView={() => panel.current?.resetView()}
        onUpdateCamera={() => currentCamera && updateCamera(currentCamera)}
        onInfoChange={setInfoOpen}
        onShowCameraHelpersChange={setShowCameraHelpers}
        onShowLightHelpersChange={setShowLightHelpers}
        onSnapChange={setSnap}
        onSpaceChange={setSpace}
      />
      {infoOpen ? <SceneHelp editing={editing} onClose={() => setInfoOpen(false)} /> : null}
      {editing && !hasAuthoredLight && annotations.length ? (
        <button
          className="absolute bottom-10 left-3 z-20 max-w-sm rounded border border-amber-400/40 bg-black/75 px-3 py-2 text-left text-xs text-amber-100 hover:bg-black"
          style={{ bottom: "2.5rem" }}
          type="button"
          onClick={addStudioLighting}
        >
          Preview lighting is active. Add studio lighting to author this appearance.
        </button>
      ) : null}
      {!annotations.length && page ? (
        <EmptyScenePrompt
          creating={creating}
          onAdd={(url) => createDirect("@manifest-editor/model-annotation", { url })}
        />
      ) : null}
      <ScenePanel
        ref={panel}
        key={sceneRef.id}
        scene={sceneInput!}
        vault={vault}
        selectedAnnotation={selectedAnnotation}
        onSelectAnnotation={selectAnnotation}
        cameraControls={{ mode: editing ? "orbit" : "manifest" }}
        stage={editing}
        resourceDecorator={(resource) =>
          editing ? (
            <SceneResourceEditor
              {...resource}
              mode={mode}
              space={space}
              snap={snap}
              showCameraHelpers={showCameraHelpers}
              showLightHelpers={showLightHelpers}
              onTransformChange={() => restoreTransformView()}
              onCommit={(value) => {
                commitTransform(value);
                restoreTransformView(true);
              }}
              onCancel={() => {
                setMessage("Transform cancelled");
                restoreTransformView(true);
              }}
            />
          ) : null
        }
        className="h-full min-h-0 bg-me-gray-900"
        style={{ height: "100%" }}
        loadingFallback="Loading scene…"
        errorFallback="The scene could not be rendered."
        onResourceStatusChange={(nextStatuses) => {
          setStatuses(nextStatuses);
          if (
            editing &&
            sceneId &&
            initiallyFramedScene.current !== sceneId &&
            nextStatuses.length > 0 &&
            nextStatuses.every((status) => status.status !== "loading")
          ) {
            initiallyFramedScene.current = sceneId;
            queueMicrotask(() => panel.current?.frameAll());
          }
        }}
        onDiagnostic={(diagnostic) => {
          if (diagnostic.severity !== "info") setMessage(diagnostic.message);
        }}
      >
        {selectedAnnotationPoint ? (
          <Html position={selectedAnnotationPoint} center style={{ pointerEvents: "none" }}>
            <span
              aria-hidden="true"
              className="block h-4 w-4 rounded-full border-2 border-white bg-me-primary-500 shadow-md"
              data-selected-annotation-point
            />
          </Html>
        ) : null}
        <SceneSurfacePicker
          active={pickingAnnotationPoint}
          modelAnnotationIds={modelAnnotationIds}
          onPick={(point) => sceneId && sceneAnnotationCreation.pick(sceneId, point)}
        />
      </ScenePanel>
      <output className="pointer-events-none absolute bottom-2 right-3 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white">
        {pickingAnnotationPoint ? "Click a model surface to place the annotation" : selectedItem?.label || "Scene"}
        {selectedStatus ? ` · ${selectedStatus.status}` : ""}
        {message ? ` · ${message}` : ""}
      </output>
    </div>
  );
}

function SceneToolbar({
  cameras,
  currentCamera,
  editing,
  infoOpen,
  mode,
  selectedAnnotation,
  showCameraHelpers,
  showLightHelpers,
  snap,
  space,
  viewCameraId,
  onCameraChange,
  onEditingChange,
  onFrame,
  onInfoChange,
  onModeChange,
  onResetView,
  onUpdateCamera,
  onShowCameraHelpersChange,
  onShowLightHelpersChange,
  onSnapChange,
  onSpaceChange,
}: any) {
  return (
    <div
      aria-label={editing ? "Scene editing tools" : "Scene viewing tools"}
      className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-md border border-me-gray-300 bg-white p-1 text-me-gray-900 shadow-sm"
      role="toolbar"
      style={{ maxWidth: "calc(100% - 1.5rem)", width: "max-content" }}
    >
      {editing ? (
        <>
          <fieldset
            aria-label="Transform tool"
            className="m-0 flex min-w-0 overflow-hidden rounded border border-me-gray-300 p-0"
          >
            {(["translate", "rotate", "scale"] as SceneTransformMode[]).map((tool) => (
              <ToolbarButton
                grouped
                key={tool}
                active={mode === tool}
                aria-label={toolLabels[tool]}
                disabled={!selectedAnnotation}
                title={`${toolLabels[tool]} (${tool === "translate" ? "W" : tool === "rotate" ? "E" : "R"})`}
                onClick={() => onModeChange(tool)}
              >
                <SceneIcon className="h-4 w-4" name={toolIcons[tool]} />
              </ToolbarButton>
            ))}
          </fieldset>
          <label title="Transform space">
            <span className="sr-only">Transform space</span>
            <select
              aria-label="Transform space"
              className="h-8 rounded border border-me-gray-300 bg-white px-2 text-xs text-me-gray-900 hover:bg-me-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!selectedAnnotation}
              value={space}
              onChange={(event) => onSpaceChange(event.target.value)}
            >
              <option value="local">Local</option>
              <option value="world">World</option>
            </select>
          </label>
          <ToolbarButton
            active={snap}
            aria-label="Snap transforms"
            disabled={!selectedAnnotation}
            title={`${snap ? "Disable" : "Enable"} transform snapping`}
            onClick={() => onSnapChange(!snap)}
          >
            <SceneIcon className="h-4 w-4" name="snap" />
          </ToolbarButton>
          <ToolbarButton aria-label="Frame selection" title="Frame selection (F)" onClick={onFrame}>
            <SceneIcon className="h-4 w-4" name="frame" />
          </ToolbarButton>
          <ToolbarButton aria-label="Reset view" title="Reset view" onClick={onResetView}>
            <SceneIcon className="h-4 w-4" name="reset-view" />
          </ToolbarButton>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-me-gray-300" />
          {currentCamera ? (
            <ToolbarButton
              aria-label={`Update ${currentCamera.label}`}
              title={`Update ${currentCamera.label} from the current view`}
              onClick={onUpdateCamera}
            >
              <SceneIcon className="h-4 w-4" name="camera-update" />
            </ToolbarButton>
          ) : null}
          <ToolbarButton
            active={showCameraHelpers}
            aria-label="Camera helpers"
            title={`${showCameraHelpers ? "Hide" : "Show"} camera helpers`}
            onClick={() => onShowCameraHelpersChange(!showCameraHelpers)}
          >
            <SceneIcon className="h-4 w-4" name="camera" />
          </ToolbarButton>
          <ToolbarButton
            active={showLightHelpers}
            aria-label="Light helpers"
            title={`${showLightHelpers ? "Hide" : "Show"} light helpers`}
            onClick={() => onShowLightHelpersChange(!showLightHelpers)}
          >
            <SceneIcon className="h-4 w-4" name="light" />
          </ToolbarButton>
        </>
      ) : (
        <label className="flex items-center gap-1 pl-1" title="View from camera">
          <SceneIcon className="h-4 w-4" name="camera" />
          <span className="sr-only">View from camera</span>
          <select
            aria-label="Scene camera"
            className="h-8 max-w-48 rounded border border-me-gray-300 bg-white px-2 text-xs text-me-gray-900 hover:bg-me-gray-100"
            value={viewCameraId}
            onChange={(event) => onCameraChange(event.target.value)}
          >
            <option value="">Free view</option>
            {cameras.map((camera: any) => (
              <option key={camera.annotation.id} value={camera.resource.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {!editing ? (
        <ToolbarButton aria-label="Reset view" title="Reset view" onClick={onResetView}>
          <SceneIcon className="h-4 w-4" name="reset-view" />
        </ToolbarButton>
      ) : null}
      <span aria-hidden className="mx-0.5 h-5 w-px bg-me-gray-300" />
      <ToolbarButton
        active={infoOpen}
        aria-label="Scene controls help"
        title="Controls and shortcuts (?)"
        onClick={() => onInfoChange(!infoOpen)}
      >
        <InfoIcon />
      </ToolbarButton>
      <ToolbarButton
        aria-label={editing ? "View scene" : "Edit scene"}
        title={editing ? "Switch to view mode" : "Switch to edit mode"}
        onClick={() => onEditingChange(!editing)}
      >
        {editing ? <PreviewIcon /> : <EditTextIcon />}
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ active, className = "", grouped = false, ...props }: any) {
  return (
    <button
      type="button"
      aria-pressed={active === undefined ? undefined : active}
      className={`flex h-8 min-w-8 items-center justify-center text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
        grouped ? "border-r border-me-gray-300 px-2 last:border-r-0" : "rounded border border-me-gray-300 px-2"
      } ${
        active
          ? "bg-me-primary-500 text-white hover:bg-me-primary-600"
          : "bg-white text-me-gray-700 hover:bg-me-gray-100 hover:text-me-gray-900"
      } ${className}`}
      {...props}
    />
  );
}

function SceneHelp({ editing, onClose }: { editing: boolean; onClose: () => void }) {
  return (
    <aside
      className="absolute right-3 top-16 z-30 w-72 rounded-md border border-me-gray-300 bg-white p-3 text-sm text-me-gray-900 shadow-sm"
      aria-label="Scene controls"
      style={{ width: "18rem" }}
    >
      <div className="flex items-center justify-between">
        <strong>{editing ? "Edit controls" : "View controls"}</strong>
        <button
          className="rounded px-1.5 py-0.5 text-me-gray-600 hover:bg-me-gray-100 hover:text-me-gray-900"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      {editing ? (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="font-mono text-me-gray-600">W / E / R</dt>
          <dd>Move, rotate, or scale</dd>
          <dt className="font-mono text-me-gray-600">F</dt>
          <dd>Frame the selection</dd>
          <dt className="font-mono text-me-gray-600">Esc</dt>
          <dd>Cancel a transform</dd>
          <dt className="font-mono text-me-gray-600">Drag</dt>
          <dd>Orbit the free camera</dd>
        </dl>
      ) : (
        <div className="mt-2 space-y-2 text-xs text-me-gray-600">
          <p>Choose an authored camera or Free view from the View menu.</p>
          <p>
            Free-view mouse and keyboard controls are provided by the Scene viewer. Authored cameras follow their
            declared interaction mode.
          </p>
        </div>
      )}
      <p className="mt-2 border-t border-me-gray-300 pt-2 text-xs text-me-gray-600">
        Press ? to show or hide this panel.
      </p>
    </aside>
  );
}

function EmptyScenePrompt({ creating, onAdd }: { creating: boolean; onAdd: (url: string) => unknown }) {
  return <ModelUrlPrompt creating={creating} empty onAdd={onAdd} />;
}

function ModelUrlPrompt({
  creating,
  empty = false,
  onAdd,
  onCancel,
}: {
  creating: boolean;
  empty?: boolean;
  onAdd: (url: string) => unknown;
  onCancel?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const parsed = new URL(url);
      if (!parsed.protocol.startsWith("http")) throw new Error();
      setError("");
      onAdd(url);
    } catch {
      setError("Enter a public HTTP or HTTPS model URL");
    }
  };
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pt-16">
      <form
        className="w-full max-w-xl rounded border border-white/20 bg-gray-950/90 p-5 text-white shadow"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold">{empty ? "Add your first 3D model" : "Add a 3D model"}</h2>
          {onCancel ? (
            <button className="text-sm text-gray-300 hover:text-white" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-300">
          Paste a public GLB or glTF URL. The model will be placed at the Scene origin.
        </p>
        <label className="mt-4 block text-sm" htmlFor="empty-scene-model-url">
          Model URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="empty-scene-model-url"
            className="min-w-0 flex-1 rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-me-400 focus:outline-none"
            placeholder="https://example.org/model.glb"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button
            className="rounded bg-me-600 px-4 py-2 text-sm font-medium hover:bg-me-500 disabled:opacity-50"
            disabled={!url || creating}
            type="submit"
          >
            {creating ? "Adding…" : "Add model"}
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}

export function cameraPayloadFromView(view: SceneView, label: string) {
  return {
    type: view.projection === "orthographic" ? "OrthographicCamera" : "PerspectiveCamera",
    label,
    view,
  };
}
