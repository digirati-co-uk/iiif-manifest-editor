import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type FormEvent, useState } from "react";

export const cameraTypes = ["PerspectiveCamera", "OrthographicCamera"] as const;
export const lightTypes = ["AmbientLight", "DirectionalLight", "PointLight", "SpotLight"] as const;
export type CameraType = (typeof cameraTypes)[number];
export type LightType = (typeof lightTypes)[number];

export interface CreateSceneComponentPayload {
  type: CameraType | LightType;
  label?: string;
  color?: string;
  intensity?: number;
}

export function createSceneComponentAnnotation(data: CreateSceneComponentPayload, ctx: CreatorFunctionContext) {
  const id = ctx.generateId(data.type.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^-/, ""));
  const component = ctx.embed({
    id,
    type: data.type,
    label: data.label ? { en: [data.label] } : undefined,
    color: data.type.endsWith("Light") ? data.color || "#ffffff" : undefined,
    intensity: data.type.endsWith("Light") ? (data.intensity ?? 1) : undefined,
  });

  return ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    motivation: "painting",
    body: component,
    target: ctx.getTarget(),
  });
}

export function SceneComponentCreatorForm({
  kind,
  ...props
}: CreatorContext<CreateSceneComponentPayload> & { kind: "camera" | "light" }) {
  const types = kind === "camera" ? cameraTypes : lightTypes;
  const [type, setType] = useState<CameraType | LightType>(types[0]);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [intensity, setIntensity] = useState(1);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    props.runCreate({ type, label: label || undefined, color, intensity });
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
        {kind === "light" ? (
          <>
            <InputContainer $wide>
              <InputLabel htmlFor="light-color">Colour</InputLabel>
              <Input id="light-color" value={color} onChange={(event) => setColor(event.target.value)} />
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
        <ActionButton primary type="submit">
          Add {kind}
        </ActionButton>
      </form>
    </PaddedSidebarContainer>
  );
}
