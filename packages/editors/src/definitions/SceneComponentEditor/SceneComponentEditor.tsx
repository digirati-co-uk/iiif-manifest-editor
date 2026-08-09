import { isSpecificResource } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useGenericEditor } from "@manifest-editor/shell";
import { useVault, useVaultSelector } from "react-iiif-vault";
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

export function SceneComponentEditor() {
  const annotationEditor = useEditor();
  const vault = useVault();
  const body = resolveFirstAnnotationBody({ body: annotationEditor.annotation.body.get() }, vault);
  const source = isSpecificResource(body) ? body.source : body;
  const componentEditor = useGenericEditor(source, {
    parent: annotationEditor.ref(),
    parentProperty: "body",
    index: 0,
  });
  const resource = useVaultSelector(
    (_, currentVault) => currentVault.get(source, { skipSelfReturn: false }),
    [source.id]
  );
  const fields = cameraFields[resource?.type] || lightFields[resource?.type] || [];

  const set = (property: string, value: string) => {
    if (property === "environmentMap") {
      vault.modifyEntityField(source as any, property, {
        id: value,
        type: "Image",
        format: value.toLowerCase().split(/[?#]/)[0]?.endsWith(".hdr") ? "image/vnd.radiance" : undefined,
        profile: "equirectangular",
      });
      return;
    }
    const numberValue = Number(value);
    vault.modifyEntityField(source as any, property, property === "color" ? value : numberValue);
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
            {property.replace(/([A-Z])/g, " $1")}
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
                id={`scene-component-${property}`}
                value={(resource as any)?.color || ""}
                onChange={(event) => set(property, event.target.value)}
              />
            </div>
          ) : (
            <Input
              id={`scene-component-${property}`}
              type={property === "environmentMap" ? "url" : "number"}
              step={property === "environmentMap" ? undefined : "0.1"}
              value={
                property === "environmentMap"
                  ? ((resource as any)?.environmentMap?.id ?? "")
                  : ((resource as any)?.[property] ?? "")
              }
              onChange={(event) => set(property, event.target.value)}
            />
          )}
        </InputContainer>
      ))}
      <TransformFields />
    </PaddedSidebarContainer>
  );
}
