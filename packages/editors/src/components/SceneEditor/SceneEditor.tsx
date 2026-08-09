import type { Vault4 } from "@iiif/helpers/vault-4";
import { useCreator, useEditingResource, useInlineCreator, useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
import {
  ScenePanel,
  type ScenePanelHandle,
  type SceneResourceStatus,
  type SceneTransformMode,
  type SceneTransformValue,
  type SceneView,
} from "react-iiif-vault/scene-panel";
import "react-iiif-vault/scene-panel.css";
import { useInStack } from "../../helpers";
import { sceneTransformValueToTransforms } from "../../helpers/model-transforms";
import { setAnnotationBodyTransforms } from "../../helpers/scene-annotation-body";
import { describeSceneAnnotation } from "../../helpers/scene-items";

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

  const saveCamera = useCallback(async () => {
    const view = panel.current?.getView();
    if (!view) return;
    const camera = await createDirect(
      "@manifest-editor/camera-annotation",
      cameraPayloadFromView(view, `Camera ${cameras.length + 1}`)
    );
    if (camera) setMessage("Camera saved from the current view");
  }, [cameras.length, createDirect]);

  const updateSelectedCamera = useCallback(() => {
    const view = panel.current?.getView();
    if (!view || !selectedItem || selectedItem.group !== "Cameras") return;
    vault.batch(() => {
      const resource = { id: selectedItem.resource.id, type: "ContentResource" } as any;
      vault.modifyEntityField(resource, "near", view.near);
      vault.modifyEntityField(resource, "far", view.far);
      vault.modifyEntityField(resource, "lookAt", {
        type: "PointSelector",
        x: view.target[0],
        y: view.target[1],
        z: view.target[2],
      });
      if (selectedItem.type === "PerspectiveCamera") {
        vault.modifyEntityField(resource, "fieldOfView", view.fieldOfView || 50);
      } else {
        vault.modifyEntityField(resource, "viewHeight", view.viewHeight || 2);
      }
      setAnnotationBodyTransforms(
        { id: selectedItem.annotation.id, type: "Annotation" },
        sceneTransformValueToTransforms({
          translation: view.position,
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        }),
        vault
      );
    });
    setMessage(`${selectedItem.label} updated from the current view`);
  }, [selectedItem, vault]);

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
  }, [selectedAnnotation]);

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
        editing={editing}
        mode={mode}
        selectedAnnotation={selectedAnnotation}
        snap={snap}
        space={space}
        onAddModel={() => setAddingModel(true)}
        onAddLight={() => createActions.creator("@manifest-editor/light-annotation")}
        onAddStudioLighting={addStudioLighting}
        onCameraChange={(id: string) => {
          if (id) panel.current?.selectCamera(id);
          else {
            const view = panel.current?.getView();
            if (view) panel.current?.setView(view);
          }
        }}
        onEditingChange={setEditing}
        onFrame={() =>
          selectedAnnotation ? panel.current?.frameAnnotation(selectedAnnotation) : panel.current?.frameAll()
        }
        onModeChange={setMode}
        onResetView={() => panel.current?.resetView()}
        onSaveCamera={saveCamera}
        onUpdateCamera={updateSelectedCamera}
        onSnapChange={setSnap}
        onSpaceChange={setSpace}
      />
      {!editing && cameras.length ? (
        <div className="absolute left-3 top-14 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white">Preview mode</div>
      ) : null}
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
        controls={!editing}
        cameraControls={{ mode: editing ? "orbit" : "manifest" }}
        stage={editing}
        editing={{
          enabled: editing,
          mode,
          space,
          selectedAnnotation,
          translationSnap: snap ? 0.25 : null,
          rotationSnap: snap ? 15 : null,
          scaleSnap: snap ? 0.1 : null,
          showSelectionOutline: true,
          showLightHelpers: true,
          showCameraHelpers: true,
          onSelectAnnotation: selectAnnotation,
          onTransformCommit: commitTransform,
          onTransformCancel: () => setMessage("Transform cancelled"),
        }}
        className="h-full min-h-0 bg-me-gray-900"
        style={{ height: "100%" }}
        loadingFallback="Loading scene…"
        errorFallback="The scene could not be rendered."
        onResourceStatusChange={setStatuses}
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
  cameras,
  editing,
  mode,
  selectedAnnotation,
  snap,
  space,
  onAddModel,
  onAddLight,
  onAddStudioLighting,
  onCameraChange,
  onEditingChange,
  onFrame,
  onModeChange,
  onResetView,
  onSaveCamera,
  onUpdateCamera,
  onSnapChange,
  onSpaceChange,
}: any) {
  return (
    <div
      aria-label="Scene editing tools"
      className="absolute left-3 right-3 top-3 z-30 flex min-h-10 flex-wrap items-center gap-1 rounded border border-white/15 bg-black/80 p-1 text-sm text-white shadow-sm"
      role="toolbar"
    >
      {(["translate", "rotate", "scale"] as SceneTransformMode[]).map((tool) => (
        <ToolbarButton
          key={tool}
          active={editing && mode === tool}
          disabled={!editing || !selectedAnnotation}
          title={`${toolLabels[tool]} (${tool === "translate" ? "W" : tool === "rotate" ? "E" : "R"})`}
          onClick={() => onModeChange(tool)}
        >
          {toolLabels[tool]}
        </ToolbarButton>
      ))}
      <span className="mx-1 h-5 w-px bg-white/20" />
      <label className="flex items-center gap-1 px-1 text-xs">
        Space
        <select
          className="rounded border border-white/20 bg-zinc-800 px-1.5 py-1 text-white"
          disabled={!editing}
          value={space}
          onChange={(event) => onSpaceChange(event.target.value)}
        >
          <option value="local">Local</option>
          <option value="world">World</option>
        </select>
      </label>
      <ToolbarButton active={snap} disabled={!editing} onClick={() => onSnapChange(!snap)}>
        Snap
      </ToolbarButton>
      <ToolbarButton title="Frame selection (F)" onClick={onFrame}>
        Frame
      </ToolbarButton>
      <ToolbarButton onClick={onResetView}>Reset view</ToolbarButton>
      <span className="mx-1 h-5 w-px bg-white/20" />
      <ToolbarButton disabled={!editing} onClick={onAddModel}>
        Add model
      </ToolbarButton>
      <ToolbarButton disabled={!editing} onClick={onAddLight}>
        Add light
      </ToolbarButton>
      <ToolbarButton disabled={!editing} onClick={onAddStudioLighting}>
        Studio light
      </ToolbarButton>
      <ToolbarButton disabled={!editing} onClick={onSaveCamera}>
        Save camera
      </ToolbarButton>
      {selectedAnnotation && cameras.some((camera: any) => camera.annotation.id === selectedAnnotation) ? (
        <ToolbarButton disabled={!editing} onClick={onUpdateCamera}>
          Update camera
        </ToolbarButton>
      ) : null}
      {cameras.length ? (
        <label className="flex items-center gap-1 px-1 text-xs">
          View
          <select
            className="max-w-40 rounded border border-white/20 bg-zinc-800 px-1.5 py-1 text-white"
            defaultValue=""
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
      ) : null}
      <span className="min-w-2 flex-1" />
      <ToolbarButton active={!editing} onClick={() => onEditingChange(!editing)}>
        {editing ? "Preview" : "Edit"}
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({ active, className = "", ...props }: any) {
  return (
    <button
      type="button"
      aria-pressed={active || undefined}
      className={`rounded border px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-me-400 bg-me-600" : "border-transparent hover:border-white/20 hover:bg-white/10"
      } ${className}`}
      {...props}
    />
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
        className="w-full max-w-xl rounded border border-white/20 bg-zinc-950/90 p-5 text-white shadow"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold">{empty ? "Add your first 3D model" : "Add a 3D model"}</h2>
          {onCancel ? (
            <button className="text-sm text-zinc-300 hover:text-white" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-zinc-300">
          Paste a public GLB or glTF URL. The model will be placed at the Scene origin.
        </p>
        <label className="mt-4 block text-sm" htmlFor="empty-scene-model-url">
          Model URL
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="empty-scene-model-url"
            className="min-w-0 flex-1 rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-me-400 focus:outline-none"
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
