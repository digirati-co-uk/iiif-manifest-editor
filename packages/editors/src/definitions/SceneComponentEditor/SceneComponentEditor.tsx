import { isSpecificResource } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useGenericEditor } from "@manifest-editor/shell";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputContainer, InputLabel } from "../../components/Input";
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
};

export function SceneComponentEditor() {
  const annotationEditor = useEditor();
  const vault = useVault();
  const body = annotationEditor.annotation.body.getFirst() as any;
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
          <Input
            id={`scene-component-${property}`}
            type={property === "color" ? "text" : "number"}
            step={property === "color" ? undefined : "0.1"}
            value={(resource as any)?.[property] ?? ""}
            onChange={(event) => set(property, event.target.value)}
          />
        </InputContainer>
      ))}
      <TransformFields />
    </PaddedSidebarContainer>
  );
}
