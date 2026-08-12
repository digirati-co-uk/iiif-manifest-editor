import { isSpecificResource } from "@iiif/parser/presentation-4";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useGenericEditor } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault/presentation-4";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { resolveFirstAnnotationBody } from "../../helpers/scene-annotation-body";
import { TransformFields } from "../Model3DEditor/TransformFields";

const cameraFields: Record<string, string[]> = {
  PerspectiveCamera: ["near", "far", "fieldOfView"],
  OrthographicCamera: ["near", "far", "viewHeight"],
};
const lightFields: Record<string, string[]> = {
  AmbientLight: ["color", "intensity"],
  DirectionalLight: ["color", "intensity"],
  PointLight: ["color", "intensity"],
  SpotLight: ["color", "intensity", "angle"],
  ImageBasedLight: ["environmentMap", "intensity"],
};

function getFieldLabel(property: string) {
  if (property === "color") return "Colour";
  if (property === "angle") return "Angle (degrees)";
  if (property === "environmentMap") return "Environment map URL";
  return property.replace(/([A-Z])/g, " $1");
}

export function SceneComponentEditor() {
  const annotationEditor = useEditor();
  const vault = useVault();
  const body = resolveFirstAnnotationBody({ body: annotationEditor.annotation.body.get() }, vault);
  const source = isSpecificResource(body) ? body.source : body;
  const componentRef = useMemo(() => ({ id: source.id, type: "ContentResource" as const }), [source.id]);
  const componentEditor = useGenericEditor(componentRef, {
    parent: annotationEditor.ref(),
    parentProperty: "body",
    index: 0,
  });
  const resource = useVaultSelector(
    (_, currentVault) => currentVault.get(componentRef, { skipSelfReturn: false }),
    [componentRef.id]
  );
  const fields = cameraFields[resource?.type] || lightFields[resource?.type] || [];

  const set = (property: string, value: string) => {
    if (property === "environmentMap") {
      vault.modifyEntityField(
        componentRef as any,
        property,
        value
          ? {
              id: value,
              type: "Image",
              format: value.toLowerCase().split(/[?#]/)[0]?.endsWith(".hdr") ? "image/vnd.radiance" : undefined,
              profile: "equirectangular",
            }
          : undefined
      );
      return;
    }
    if (property !== "color" && (!value || !Number.isFinite(Number(value)))) return;
    vault.modifyEntityField(componentRef as any, property, property === "color" ? value : Number(value));
  };

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={componentEditor.descriptive.label.focusId()}
        label="Label"
        fields={componentEditor.descriptive.label.get()}
        onSave={(value: any) => componentEditor.descriptive.label.set(value.toInternationalString())}
      />
      <InputContainer $wide>
        <InputLabel>Type</InputLabel>
        <Input disabled value={resource?.type || ""} />
      </InputContainer>
      {fields.map((property) => (
        <InputContainer $wide key={property}>
          <InputLabel htmlFor={`scene-component-${property}`} $caps>
            {getFieldLabel(property)}
          </InputLabel>
          {property === "color" ? (
            <div className="flex gap-2">
              <Input
                aria-label="Light colour picker"
                className="h-10 w-12 shrink-0 p-1"
                type="color"
                value={(resource as any)?.color || "#ffffff"}
                onChange={(event) => set(property, event.target.value)}
              />
              <Input
                key={`${componentRef.id}-color-${(resource as any)?.color || ""}`}
                id={`scene-component-${property}`}
                defaultValue={(resource as any)?.color || ""}
                onBlur={(event) => set(property, event.target.value)}
              />
            </div>
          ) : (
            <Input
              key={`${componentRef.id}-${property}-${
                property === "environmentMap"
                  ? ((resource as any)?.environmentMap?.id ?? "")
                  : ((resource as any)?.[property] ?? "")
              }`}
              id={`scene-component-${property}`}
              type={property === "environmentMap" ? "url" : "number"}
              min={property === "intensity" || property === "angle" ? 0 : undefined}
              max={property === "angle" ? 90 : undefined}
              step={property === "angle" ? 1 : property === "environmentMap" ? undefined : "0.1"}
              defaultValue={
                property === "environmentMap"
                  ? ((resource as any)?.environmentMap?.id ?? "")
                  : ((resource as any)?.[property] ?? "")
              }
              onBlur={(event) => set(property, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
          )}
        </InputContainer>
      ))}
      <TransformFields />
    </PaddedSidebarContainer>
  );
}
