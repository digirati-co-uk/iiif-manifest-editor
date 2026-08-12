import type { Vault4 } from "@iiif/helpers/vault-4";
import { EditTextIcon, InfoIcon, PreviewIcon, ResetIcon } from "@manifest-editor/components";
import { useEditingResource, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
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
  sceneTransformValueToTransforms,
  type SceneTransformMode,
  type SceneTransformValue,
} from "../../helpers/model-transforms";
import { setAnnotationBodyTransforms } from "../../helpers/scene-annotation-body";
import {
  sceneAnnotationCreation,
  useSceneAnnotationCreation,
} from "../../helpers/scene-annotation-creation";
import { sceneCameraRotation, sceneCameraView } from "../../helpers/scene-camera";
import { describeSceneAnnotation } from "../../helpers/scene-items";
import { SceneResourceEditor } from "./SceneResourceEditor";
import { SceneSurfacePicker } from "./SceneSurfacePicker";

const toolLabels: Record<SceneTransformMode, string> = {
  translate: "Move",
  rotate: "Rotate",
  scale: "Scale",
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
  const sceneRef = scene?.resource.source;
  const sceneId = sceneRef?.id;
  const sceneInput = useMemo(() => (sceneId ? { id: sceneId, type: "Scene" as const } : null), [sceneId]);
  const selectedAnnotation = current?.resource.source.type === "Annotation" ? current.resource.source.id : null;
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
      if (!sceneRef) return { page: undefined, annotations: [] as any[], modelAnnotations: [] as any[] };
      const currentScene = currentVault.get(sceneRef as any, { skipSelfReturn: false }) as any;
      const pages = (currentVault.get([...(currentScene?.items || [])], { parent: currentScene }) || []) as any[];
      const page = pages[0];
      const annotations = page ? ((currentVault.get((page as any).items || [], { parent: page }) || []) as any[]) : [];
      const modelAnnotations = pages.flatMap((candidate) =>
        (currentVault.get([...(candidate?.items || [])], { parent: candidate }) || []) as any[],
      );
      return { page, annotations, modelAnnotations };
    },
    [sceneRef?.id]
  );
  const page = resolved.page as any;
  const annotations = resolved.annotations;
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
          .map((item) => item.annotation.id),
      ),
    [resolved.modelAnnotations, vault],
  );
  const pickingAnnotationPoint = !!(
    annotationDraft &&
    annotationDraft.sceneId === sceneId &&
    !annotationDraft.point
  );
  const selectedItem = sceneItems.find((item) => item.annotation.id === selectedAnnotation);
  const hasAuthoredLight = sceneItems.some((item) => item.group === "Lights");
  const cameras = sceneItems.filter((item) => item.group === "Cameras");
  const selectedCamera = selectedItem?.group === "Cameras" ? selectedItem : null;
  const selectedCameraAnnotationId = selectedCamera?.annotation.id || "";
  const currentCamera = selectedCamera || cameras.find((camera) => camera.resource.id === viewCameraId);

  const selectAnnotation = useCallback(
    (annotation: any | null) => {
      if (!sceneRef) return;
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
    [annotations, layout, page, sceneRef]
  );

  const commitTransform = useCallback(
    (value: SceneTransformValue) => {
      setAnnotationBodyTransforms(
        { id: value.annotationId, type: "Annotation" },
        sceneTransformValueToTransforms(value),
        vault
      );
      setMessage(`${toolLabels[mode]} saved`);
    },
    [mode, vault]
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
                <SceneToolIcon name={tool === "translate" ? "move" : tool} />
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
            <SceneToolIcon name="snap" />
          </ToolbarButton>
          <ToolbarButton aria-label="Frame selection" title="Frame selection (F)" onClick={onFrame}>
            <SceneToolIcon name="frame" />
          </ToolbarButton>
          <ToolbarButton aria-label="Reset view" title="Reset view" onClick={onResetView}>
            <ResetIcon />
          </ToolbarButton>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-me-gray-300" />
          {currentCamera ? (
            <ToolbarButton
              aria-label={`Update ${currentCamera.label}`}
              title={`Update ${currentCamera.label} from the current view`}
              onClick={onUpdateCamera}
            >
              <SceneToolIcon name="camera-update" />
            </ToolbarButton>
          ) : null}
          <ToolbarButton
            active={showCameraHelpers}
            aria-label="Camera helpers"
            title={`${showCameraHelpers ? "Hide" : "Show"} camera helpers`}
            onClick={() => onShowCameraHelpersChange(!showCameraHelpers)}
          >
            <SceneToolIcon name="camera" />
          </ToolbarButton>
          <ToolbarButton
            active={showLightHelpers}
            aria-label="Light helpers"
            title={`${showLightHelpers ? "Hide" : "Show"} light helpers`}
            onClick={() => onShowLightHelpersChange(!showLightHelpers)}
          >
            <SceneToolIcon name="light" />
          </ToolbarButton>
        </>
      ) : (
        <label className="flex items-center gap-1 pl-1" title="View from camera">
          <SceneToolIcon name="camera" />
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
          <ResetIcon />
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

type SceneToolIconName = "move" | "rotate" | "scale" | "snap" | "frame" | "camera" | "camera-update" | "light";

function SceneToolIcon({ name }: { name: SceneToolIconName }) {
  const common = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (name === "move") {
    return (
      <svg {...common}>
        <path d="m8 3 4-2 4 2M8 21l4 2 4-2M3 8l-2 4 2 4M21 8l2 4-2 4M12 1v22M1 12h22" />
      </svg>
    );
  }
  if (name === "rotate") {
    return (
      <svg {...common}>
        <path d="M20 7V3m0 0h-4m4 0-3.1 3.1a8 8 0 1 0 2.2 8.4" />
      </svg>
    );
  }
  if (name === "scale") {
    return (
      <svg {...common}>
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    );
  }
  if (name === "snap") {
    return (
      <svg {...common}>
        <path d="M6 3v8a6 6 0 0 0 12 0V3M6 7h4M14 7h4M6 3h4M14 3h4" />
      </svg>
    );
  }
  if (name === "frame") {
    return (
      <svg {...common}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "light") {
    return (
      <svg {...common}>
        <path d="M9 18h6M10 22h4M8.5 15.5a6 6 0 1 1 7 0c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14.5 6 13 4h-2L9.5 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4.5Z" />
      <circle cx="12" cy="12.5" r="3" />
      {name === "camera-update" ? <path d="M17 11h4m-2-2v4" /> : null}
    </svg>
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
