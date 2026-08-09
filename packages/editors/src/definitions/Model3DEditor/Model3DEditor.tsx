import { isSpecificResource } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useGenericEditor } from "@manifest-editor/shell";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { TransformFields } from "./TransformFields";

export function Model3DEditor() {
  const annotationEditor = useEditor();
  const body = annotationEditor.annotation.body.getFirst() as any;
  const source = isSpecificResource(body) ? body.source : body;
  const modelEditor = useGenericEditor(source, {
    parent: annotationEditor.ref(),
    parentProperty: "body",
    index: 0,
  });

  return (
    <PaddedSidebarContainer>
      <LanguageFieldEditor
        focusId={modelEditor.descriptive.label.focusId()}
        label="Label"
        fields={modelEditor.descriptive.label.get()}
        onSave={(value: any) => modelEditor.descriptive.label.set(value.toInternationalString())}
      />
      <InputContainer $wide>
        <InputLabel htmlFor={modelEditor.technical.id.focusId()}>Model URL</InputLabel>
        <Input disabled id={modelEditor.technical.id.focusId()} value={modelEditor.technical.id.get()} />
      </InputContainer>
      <InputContainer $wide>
        <InputLabel htmlFor={modelEditor.technical.format.focusId()}>Format</InputLabel>
        <Input
          id={modelEditor.technical.format.focusId()}
          value={modelEditor.technical.format.get() || ""}
          onChange={(event) => modelEditor.technical.format.set(event.target.value)}
        />
      </InputContainer>
      <TransformFields />
    </PaddedSidebarContainer>
  );
}
