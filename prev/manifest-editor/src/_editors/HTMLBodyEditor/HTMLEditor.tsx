import { useEditor, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { Reference } from "@iiif/presentation-3";
import { InputContainer, InputLabel } from "@/editors/Input";
import { RichTextLanguageField } from "@/_components/form-elements/RichTextLanguageField/RichTextLanguageField";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { TextGranularityEditor } from "@/_components/editors/TextGranularityEditor/TextGranularityEditor";

export function HTMLEditor() {
  const { annotation } = useEditor();

  const body = annotation.body.get();

  return (
    <PaddedSidebarContainer>
      {body.map((item) => (
        <HTMLEditorItem item={item as any} />
      ))}
    </PaddedSidebarContainer>
  );
}

function HTMLEditorItem({ item }: { item: Reference }) {
  const editor = useGenericEditor(item);

  const { textGranularity } = editor.extensions;
  const { language, value } = editor.descriptive;
  const { motivation } = editor.technical;

  return (
    <>
      <InputContainer wide>
        <InputLabel>HTML Body</InputLabel>

        <RichTextLanguageField
          value={value.get()}
          language={language.get() as any}
          onUpdateLanguage={(lng) => language.set(lng as any)}
          languages={["en", "nl", "cy"]}
          onUpdate={(e) => value.set(e)}
        />
      </InputContainer>

      {motivation.get() !== "painting" ? (
        <TextGranularityEditor
          focusId={textGranularity.focusId()}
          value={textGranularity.get()}
          onChange={(e) => textGranularity.set(e)}
        />
      ) : null}
    </>
  );
}
