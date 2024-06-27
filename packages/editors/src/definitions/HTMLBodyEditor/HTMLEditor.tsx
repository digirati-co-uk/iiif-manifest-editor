import { Reference } from "@iiif/presentation-3";
import { useEditor, useGenericEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel } from "../../components/Input";
import { TextGranularityEditor } from "../../components/TextGranularityEditor/TextGranularityEditor";
import { RichTextLanguageField } from "../../form-elements/RichTextLanguageField/RichTextLanguageField";

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
      <InputContainer $wide>
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
