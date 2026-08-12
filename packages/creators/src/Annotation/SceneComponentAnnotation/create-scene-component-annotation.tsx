import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import {
  Input,
  InputContainer,
  InputLabel,
  cameraPresets,
  type CameraPreset,
  sceneCameraPresetView,
  sceneCameraRotation,
  sceneTransformValueToTransforms,
} from "@manifest-editor/editors";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScenePanel,
  type ScenePanelHandle,
  type SceneResourceStatus,
  type SceneView,
} from "react-iiif-vault/scene-panel";
import "react-iiif-vault/scene-panel.css";

export const cameraTypes = ["PerspectiveCamera", "OrthographicCamera"] as const;
export const lightTypes = ["AmbientLight", "DirectionalLight", "ImageBasedLight", "PointLight", "SpotLight"] as const;
export type CameraType = (typeof cameraTypes)[number];
export type LightType = (typeof lightTypes)[number];

const defaultCameraView: SceneView = {
  projection: "perspective",
  position: [0, 0, 5],
  rotation: [0, 0, 0],
  target: [0, 0, 0],
  fieldOfView: 50,
  near: 0.1,
  far: 2000,
};

export interface CreateSceneComponentPayload {
  type: CameraType | LightType;
  label?: string;
  color?: string;
  intensity?: number;
  position?: readonly [number, number, number];
  lookAt?: readonly [number, number, number] | { id: string; type: string };
  view?: SceneView;
  environmentMap?: string;
}

export function createSceneComponentAnnotation(data: CreateSceneComponentPayload, ctx: CreatorFunctionContext) {
  const id = ctx.generateId(data.type.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, ""));
  const position = data.view?.position || data.position;
  const component = {
    id,
    type: data.type,
    label: data.label ? { en: [data.label] } : undefined,
    color: data.type.endsWith("Light") ? data.color || "#ffffff" : undefined,
    intensity: data.type.endsWith("Light") ? (data.intensity ?? 1) : undefined,
    near: data.type.endsWith("Camera") ? data.view?.near : undefined,
    far: data.type.endsWith("Camera") ? data.view?.far : undefined,
    fieldOfView: data.type === "PerspectiveCamera" ? data.view?.fieldOfView : undefined,
    viewHeight: data.type === "OrthographicCamera" ? data.view?.viewHeight : undefined,
    lookAt: pointOrReference(data.view?.target || data.lookAt),
    environmentMap:
      data.type === "ImageBasedLight" && data.environmentMap
        ? {
            id: data.environmentMap,
            type: "Image",
            format: data.environmentMap.toLowerCase().split(/[?#]/)[0]?.endsWith(".hdr")
              ? "image/vnd.radiance"
              : undefined,
            profile: "equirectangular",
          }
        : undefined,
    transform: position
      ? sceneTransformValueToTransforms({
          translation: position,
          rotation: data.view ? sceneCameraRotation(data.view) : [0, 0, 0],
          scale: [1, 1, 1],
        })
      : undefined,
  };

  const body = ctx.embed(component);

  return ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    motivation: ["painting"],
    body,
    target: ctx.getTarget(),
  });
}

function pointOrReference(value: CreateSceneComponentPayload["lookAt"] | SceneView["target"] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? { type: "PointSelector", x: value[0], y: value[1], z: value[2] } : value;
}

export function SceneComponentCreatorForm({
  kind,
  ...props
}: CreatorContext<CreateSceneComponentPayload> & { kind: "camera" | "light" }) {
  const types = kind === "camera" ? cameraTypes : lightTypes;
  const initialData = props.options.initialData as Partial<CreateSceneComponentPayload>;
  const initialCameraType =
    initialData.type || (initialData.view?.projection === "orthographic" ? "OrthographicCamera" : types[0]);
  const initialPreset: CameraPreset = initialData.view ? "current" : "isometric";
  const [type, setType] = useState<CameraType | LightType>(initialCameraType);
  const [preset, setPreset] = useState<CameraPreset>(initialPreset);
  const [baseView, setBaseView] = useState<SceneView>(initialData.view || defaultCameraView);
  const [label, setLabel] = useState(
    initialData.label || (kind === "camera" ? `${presetLabel(initialPreset)} camera` : "")
  );
  const [color, setColor] = useState(initialData.color || "#ffffff");
  const [intensity, setIntensity] = useState(initialData.intensity ?? 1);
  const [environmentMap, setEnvironmentMap] = useState(initialData.environmentMap || "");
  const cameraView = useMemo(
    () => sceneCameraPresetView(baseView, preset, type === "OrthographicCamera" ? "orthographic" : "perspective"),
    [baseView, preset, type]
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    props.runCreate({
      ...initialData,
      type,
      label: label || undefined,
      color,
      intensity,
      environmentMap,
      view: kind === "camera" ? cameraView : initialData.view,
    });
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
        <div style={kind === "camera" ? { display: "flex", flexWrap: "wrap", gap: "1.5rem" } : undefined}>
          <div style={kind === "camera" ? { flex: "1 1 18rem" } : undefined}>
            <InputContainer $wide>
              <InputLabel htmlFor={`${kind}-type`}>Type</InputLabel>
              <select
                id={`${kind}-type`}
                className="w-full border-b border-gray-300 bg-gray-50 p-3"
                value={type}
                onChange={(event) => setType(event.target.value as CameraType | LightType)}
              >
                {types.map((value) => (
                  <option key={value} value={value}>
                    {value.replace(/([A-Z])/g, " $1").trim()}
                  </option>
                ))}
              </select>
            </InputContainer>
            {kind === "camera" ? (
              <InputContainer $wide>
                <InputLabel htmlFor="camera-preset">View</InputLabel>
                <select
                  id="camera-preset"
                  className="w-full border-b border-gray-300 bg-gray-50 p-3"
                  value={preset}
                  onChange={(event) => {
                    const next = event.target.value as CameraPreset;
                    const previousDefault = `${presetLabel(preset)} camera`;
                    setPreset(next);
                    setLabel((current) =>
                      !current || current === previousDefault ? `${presetLabel(next)} camera` : current
                    );
                  }}
                >
                  {cameraPresets.map(({ id, label: presetName }) => (
                    <option key={id} value={id}>
                      {presetName}
                    </option>
                  ))}
                </select>
              </InputContainer>
            ) : null}
            <InputContainer $wide>
              <InputLabel htmlFor={`${kind}-label`}>Label</InputLabel>
              <Input id={`${kind}-label`} value={label} onChange={(event) => setLabel(event.target.value)} />
            </InputContainer>
            {kind === "light" && type !== "ImageBasedLight" ? (
              <>
                <InputContainer $wide>
                  <InputLabel htmlFor="light-color">Colour</InputLabel>
                  <div className="flex gap-2">
                    <Input
                      aria-label="Light colour picker"
                      className="h-10 w-12 shrink-0 p-1"
                      type="color"
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                    />
                    <Input id="light-color" value={color} onChange={(event) => setColor(event.target.value)} />
                  </div>
                </InputContainer>
                <InputContainer $wide>
                  <InputLabel htmlFor="light-intensity">Intensity</InputLabel>
                  <Input
                    id="light-intensity"
                    type="number"
                    step="0.1"
                    value={intensity}
                    onChange={(event) => setIntensity(event.target.valueAsNumber)}
                  />
                </InputContainer>
              </>
            ) : null}
            {kind === "light" && type === "ImageBasedLight" ? (
              <InputContainer $wide>
                <InputLabel htmlFor="environment-map-url">Environment map URL</InputLabel>
                <Input
                  id="environment-map-url"
                  type="url"
                  placeholder="https://example.org/environment.hdr"
                  value={environmentMap}
                  onChange={(event) => setEnvironmentMap(event.target.value)}
                />
              </InputContainer>
            ) : null}
          </div>
          {kind === "camera" && props.options.target ? (
            <CameraPresetPreview
              hasInitialView={!!initialData.view}
              scene={{ id: props.options.target.id, type: "Scene" }}
              vault={props.vault}
              view={cameraView}
              onBaseView={setBaseView}
            />
          ) : null}
        </div>
        <div className="mt-4">
          <ActionButton primary type="submit">
            Add {kind}
          </ActionButton>
        </div>
      </form>
    </PaddedSidebarContainer>
  );
}

function CameraPresetPreview({
  hasInitialView,
  scene,
  vault,
  view,
  onBaseView,
}: {
  hasInitialView: boolean;
  scene: { id: string; type: "Scene" };
  vault: CreatorContext["vault"];
  view: SceneView;
  onBaseView: (view: SceneView) => void;
}) {
  const panel = useRef<ScenePanelHandle>(null);
  const framed = useRef(hasInitialView);
  const applyView = useCallback(() => queueMicrotask(() => panel.current?.setView(view)), [view]);

  useEffect(() => {
    if (framed.current) applyView();
  }, [applyView]);

  const onStatuses = useCallback(
    (statuses: SceneResourceStatus[]) => {
      if (!statuses.length || statuses.some((status) => status.status === "loading")) return;
      if (framed.current) return applyView();
      framed.current = true;
      queueMicrotask(() => {
        panel.current?.frameAll();
        const framedView = panel.current?.getView();
        if (framedView) onBaseView(framedView);
      });
    },
    [applyView, onBaseView]
  );

  return (
    <section aria-label="Camera preview" style={{ flex: "1 1 24rem", minWidth: 0 }}>
      <h3 className="mb-2 text-sm font-medium text-gray-700">Preview</h3>
      <div className="h-72 overflow-hidden rounded-md border border-gray-300 bg-gray-900">
        <ScenePanel
          ref={panel}
          cameraControls={{ mode: "orbit" }}
          cameraCue={false}
          className="pointer-events-none h-full"
          scene={scene}
          stage={false}
          style={{ height: "100%" }}
          transitions={false}
          vault={vault}
          loadingFallback="Loading preview…"
          errorFallback="The Scene preview could not be rendered."
          onReady={applyView}
          onResourceStatusChange={onStatuses}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">The preset is relative to the Scene's current framing.</p>
    </section>
  );
}

function presetLabel(preset: CameraPreset) {
  return cameraPresets.find((item) => item.id === preset)!.label;
}
