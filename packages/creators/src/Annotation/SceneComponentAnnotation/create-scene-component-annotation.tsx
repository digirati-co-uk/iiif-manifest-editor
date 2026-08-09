import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";
import type { SceneView } from "react-iiif-vault/scene-panel";

export const cameraTypes = ["PerspectiveCamera", "OrthographicCamera"] as const;
export const lightTypes = ["AmbientLight", "DirectionalLight", "ImageBasedLight", "PointLight", "SpotLight"] as const;
export type CameraType = (typeof cameraTypes)[number];
export type LightType = (typeof lightTypes)[number];

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
    transform: position ? [{ type: "TranslateTransform", x: position[0], y: position[1], z: position[2] }] : undefined,
  };

  const body = ctx.embed(component);

  return ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    motivation: "painting",
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
  const [type, setType] = useState<CameraType | LightType>(initialData.type || types[0]);
  const [label, setLabel] = useState(initialData.label || "");
  const [color, setColor] = useState(initialData.color || "#ffffff");
  const [intensity, setIntensity] = useState(initialData.intensity ?? 1);
  const [environmentMap, setEnvironmentMap] = useState(initialData.environmentMap || "");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    props.runCreate({ ...initialData, type, label: label || undefined, color, intensity, environmentMap });
  };

  return (
    <PaddedSidebarContainer>
      <form onSubmit={onSubmit}>
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
        <ActionButton primary type="submit">
          Add {kind}
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
