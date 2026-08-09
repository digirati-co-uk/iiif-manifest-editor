import type { Vault4 } from "@iiif/helpers/vault-4";
import { useCreator, useEditingResource, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
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
import { sceneCameraRotation, sceneCameraView } from "../../helpers/scene-camera";
import { describeSceneAnnotation } from "../../helpers/scene-items";
import { SceneResourceEditor } from "./SceneResourceEditor";

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
  const [addingModel, setAddingModel] = useState(false);
  const [showLightHelpers, setShowLightHelpers] = useState(false);
  const [showCameraHelpers, setShowCameraHelpers] = useState(true);
  const [helperMenuOpen, setHelperMenuOpen] = useState(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewCameraId, setViewCameraId] = useState("");

  const resolved = useVaultSelector(
    (_, currentVault) => {
      if (!sceneRef) return { page: undefined, annotations: [] as any[] };
      const currentScene = currentVault.get(sceneRef as any, { skipSelfReturn: false }) as any;
      const page = currentScene?.items?.[0]
        ? currentVault.get(currentScene.items[0], { parent: currentScene, skipSelfReturn: false })
        : undefined;
      const annotations = page ? ((currentVault.get((page as any).items || [], { parent: page }) || []) as any[]) : [];
      return { page, annotations };
    },
    [sceneRef?.id]
  );
  const page = resolved.page as any;
  const annotations = resolved.annotations;
  const sceneItems = useMemo(
    () => annotations.map((annotation, index) => describeSceneAnnotation(annotation, vault, index)),
    [annotations, vault]
  );
  const selectedItem = sceneItems.find((item) => item.annotation.id === selectedAnnotation);
  const hasAuthoredLight = sceneItems.some((item) => item.group === "Lights");
  const cameras = sceneItems.filter((item) => item.group === "Cameras");
  const selectedCamera = selectedItem?.group === "Cameras" ? selectedItem : null;
  const selectedCameraAnnotationId = selectedCamera?.annotation.id || "";
  const currentCamera = selectedCamera || cameras.find((camera) => camera.resource.id === viewCameraId);
  const [, createActions] = useCreator(page, "items", "Annotation", sceneRef as any, { isPainting: true });

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

  const addCamera = useCallback(() => {
    const view = panel.current?.getView();
    if (!view) return;
    createActions.creator(
      "@manifest-editor/camera-annotation",
      cameraPayloadFromView(view, `Camera ${cameras.length + 1}`)
    );
  }, [cameras.length, createActions]);

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

  const saveCamera = useCallback(() => {
    if (currentCamera) updateCamera(currentCamera);
    else addCamera();
  }, [addCamera, currentCamera, updateCamera]);

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
      if (event.key === "Escape") {
        setInfoOpen(false);
        setHelperMenuOpen(false);
        setCameraMenuOpen(false);
      }
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
        cameraMenuOpen={cameraMenuOpen}
        cameras={cameras}
        currentCamera={currentCamera}
        editing={editing}
        helperMenuOpen={helperMenuOpen}
        infoOpen={infoOpen}
        mode={mode}
        selectedAnnotation={selectedAnnotation}
        showCameraHelpers={showCameraHelpers}
        showLightHelpers={showLightHelpers}
        snap={snap}
        space={space}
        viewCameraId={viewCameraId}
        onAddCamera={addCamera}
        onAddModel={() => setAddingModel(true)}
        onAddLight={() => createActions.creator("@manifest-editor/light-annotation")}
        onAddStudioLighting={addStudioLighting}
        onCameraChange={(id: string) => {
          setViewCameraId(id);
          if (id) panel.current?.selectCamera(id);
          else {
            const view = panel.current?.getView();
            if (view) panel.current?.setView(view);
          }
        }}
        onCameraMenuChange={setCameraMenuOpen}
        onEditingChange={(value: boolean) => {
          setEditing(value);
          setCameraMenuOpen(false);
          setHelperMenuOpen(false);
          setInfoOpen(false);
        }}
        onFrame={() =>
          selectedAnnotation ? panel.current?.frameAnnotation(selectedAnnotation) : panel.current?.frameAll()
        }
        onModeChange={setMode}
        onResetView={() => panel.current?.resetView()}
        onSaveCamera={saveCamera}
        onHelperMenuChange={setHelperMenuOpen}
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
      {annotations.length && addingModel ? (
        <ModelUrlPrompt
          creating={creating}
          onCancel={() => setAddingModel(false)}
          onAdd={async (url) => {
            const created = await createDirect("@manifest-editor/model-annotation", { url });
            if (created) setAddingModel(false);
          }}
        />
      ) : null}
      <ScenePanel
        ref={panel}
        key={sceneRef.id}
        scene={sceneInput!}
        vault={vault}
        controls={false}
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
      />
      <output className="pointer-events-none absolute bottom-2 right-3 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white">
        {selectedItem?.label || "Scene"}
        {selectedStatus ? ` · ${selectedStatus.status}` : ""}
        {message ? ` · ${message}` : ""}
      </output>
    </div>
  );
}

function SceneToolbar({
  cameraMenuOpen,
  cameras,
  currentCamera,
  editing,
  helperMenuOpen,
  infoOpen,
  mode,
  selectedAnnotation,
  showCameraHelpers,
  showLightHelpers,
  snap,
  space,
  viewCameraId,
  onAddCamera,
  onAddModel,
  onAddLight,
  onAddStudioLighting,
  onCameraChange,
  onCameraMenuChange,
  onEditingChange,
  onFrame,
  onHelperMenuChange,
  onInfoChange,
  onModeChange,
  onResetView,
  onSaveCamera,
  onShowCameraHelpersChange,
  onShowLightHelpersChange,
  onSnapChange,
  onSpaceChange,
}: any) {
  return (
    <div
      aria-label={editing ? "Scene editing tools" : "Scene viewing tools"}
      className="absolute left-3 right-3 top-3 z-30 flex min-h-12 flex-wrap items-center gap-1 rounded-lg border border-gray-700 bg-gray-950 p-1.5 text-sm text-white shadow-sm"
      role="toolbar"
    >
      {editing ? (
        <>
          {(["translate", "rotate", "scale"] as SceneTransformMode[]).map((tool) => (
            <ToolbarButton
              key={tool}
              active={mode === tool}
              disabled={!selectedAnnotation}
              title={`${toolLabels[tool]} (${tool === "translate" ? "W" : tool === "rotate" ? "E" : "R"})`}
              onClick={() => onModeChange(tool)}
            >
              {toolLabels[tool]}
            </ToolbarButton>
          ))}
          <span className="mx-1 h-5 w-px bg-gray-600" />
          <label className="flex items-center gap-1 px-1 text-xs">
            Space
            <select
              className="rounded-md border border-gray-600 bg-gray-800 px-1.5 py-1.5 text-white"
              value={space}
              onChange={(event) => onSpaceChange(event.target.value)}
            >
              <option value="local">Local</option>
              <option value="world">World</option>
            </select>
          </label>
          <ToolbarButton active={snap} onClick={() => onSnapChange(!snap)}>
            Snap
          </ToolbarButton>
          <ToolbarButton title="Frame selection (F)" onClick={onFrame}>
            Frame
          </ToolbarButton>
          <ToolbarButton onClick={onResetView}>Reset view</ToolbarButton>
          <span className="mx-1 h-5 w-px bg-gray-600" />
          <ToolbarButton onClick={onAddModel}>Add model</ToolbarButton>
          <ToolbarButton onClick={onAddLight}>Add light</ToolbarButton>
          <ToolbarButton onClick={onAddStudioLighting}>Studio light</ToolbarButton>
          <div className="relative flex">
            <ToolbarButton
              className="rounded-r-none"
              title={currentCamera ? `Replace ${currentCamera.label}` : "Save a camera"}
              onClick={onSaveCamera}
            >
              Save camera
            </ToolbarButton>
            <ToolbarButton
              active={cameraMenuOpen}
              aria-label="Camera save options"
              className="rounded-l-none border-l-gray-600 px-1.5"
              onClick={() => onCameraMenuChange(!cameraMenuOpen)}
            >
              ▾
            </ToolbarButton>
            {cameraMenuOpen ? (
              <div className="absolute left-0 top-full z-40 mt-1 min-w-44 rounded-md border border-gray-600 bg-gray-900 p-1 shadow-md">
                <button
                  className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-gray-700"
                  type="button"
                  onClick={() => {
                    onCameraMenuChange(false);
                    onAddCamera();
                  }}
                >
                  Add new camera
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <ToolbarButton active={helperMenuOpen} onClick={() => onHelperMenuChange(!helperMenuOpen)}>
              Helpers
            </ToolbarButton>
            {helperMenuOpen ? (
              <div className="absolute right-0 top-full z-40 mt-1 min-w-44 rounded-md border border-gray-600 bg-gray-900 p-2 text-xs shadow-md">
                <label className="flex items-center gap-2 py-1">
                  <input
                    checked={showCameraHelpers}
                    type="checkbox"
                    onChange={(event) => onShowCameraHelpersChange(event.target.checked)}
                  />
                  Camera helpers
                </label>
                <label className="flex items-center gap-2 py-1">
                  <input
                    checked={showLightHelpers}
                    type="checkbox"
                    onChange={(event) => onShowLightHelpersChange(event.target.checked)}
                  />
                  Light helpers
                </label>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <label className="flex items-center gap-1 px-1 text-xs">
          View
          <select
            aria-label="Scene camera"
            className="max-w-48 rounded-md border border-gray-600 bg-gray-800 px-2 py-1.5 text-white"
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
      {!editing ? <ToolbarButton onClick={onResetView}>Reset view</ToolbarButton> : null}
      <span className="min-w-2 flex-1" />
      <ToolbarButton
        active={infoOpen}
        aria-label="Scene controls help"
        title="Controls and shortcuts (?)"
        onClick={() => onInfoChange(!infoOpen)}
      >
        Info
      </ToolbarButton>
      <ToolbarButton active={!editing} onClick={() => onEditingChange(!editing)}>
        {editing ? "View" : "Edit"}
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ active, className = "", style, ...props }: any) {
  return (
    <button
      type="button"
      aria-pressed={active || undefined}
      className={`rounded-md border px-2 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-me-400 bg-me-600" : "border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700"
      } ${className}`}
      style={{ backgroundColor: active ? "#b84c74" : "#1f2937", ...style }}
      {...props}
    />
  );
}

function SceneHelp({ editing, onClose }: { editing: boolean; onClose: () => void }) {
  return (
    <aside
      className="absolute right-3 top-16 z-30 w-72 rounded-lg border border-gray-700 bg-gray-950 p-3 text-sm text-gray-100 shadow-md"
      aria-label="Scene controls"
    >
      <div className="flex items-center justify-between">
        <strong>{editing ? "Edit controls" : "View controls"}</strong>
        <button
          className="rounded px-1.5 py-0.5 text-gray-300 hover:bg-gray-800 hover:text-white"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      {editing ? (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="font-mono text-gray-300">W / E / R</dt>
          <dd>Move, rotate, or scale</dd>
          <dt className="font-mono text-gray-300">F</dt>
          <dd>Frame the selection</dd>
          <dt className="font-mono text-gray-300">Esc</dt>
          <dd>Cancel a transform</dd>
          <dt className="font-mono text-gray-300">Drag</dt>
          <dd>Orbit the free camera</dd>
        </dl>
      ) : (
        <div className="mt-2 space-y-2 text-xs text-gray-300">
          <p>Choose an authored camera or Free view from the View menu.</p>
          <p>
            Free-view mouse and keyboard controls are provided by the Scene viewer. Authored cameras follow their
            declared interaction mode.
          </p>
        </div>
      )}
      <p className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">Press ? to show or hide this panel.</p>
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
