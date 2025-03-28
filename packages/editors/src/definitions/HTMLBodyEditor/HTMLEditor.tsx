import type { Reference } from "@iiif/presentation-3";
import { useConfig, useEditor, useGenericEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel } from "../../components/Input";
import { TextGranularityEditor } from "../../components/TextGranularityEditor/TextGranularityEditor";
import { RichTextLanguageField } from "../../components/RichTextLanguageField/RichTextLanguageField";

export function HTMLEditor() {
  const { annotation } = useEditor();

  const body = annotation.body.get();

  return (
    <PaddedSidebarContainer>
      {body.map((item) => (
        <HTMLEditorItem key={item.id} item={item as any} />
      ))}
    </PaddedSidebarContainer>
  );
}

function HTMLEditorItem({ item }: { item: Reference }) {
  const { i18n } = useConfig();
  const editor = useGenericEditor(item);

  const { textGranularity } = editor.extensions;
  const { language, value } = editor.descriptive;
  const { motivation, mediaType } = editor.technical;

  const mt = mediaType.get();

  if (mt === "Image") {
    return <img src={item.id} alt="" />;
  }

  return (
    <>
      <InputContainer $wide>
        <InputLabel>HTML Body</InputLabel>

        <RichTextLanguageField
          value={value.get()}
          language={language.get() as any}
          onUpdateLanguage={(lng) => language.set(lng as any)}
          languages={i18n.availableLanguages}
          onUpdate={(e) => value.set(e)}
        />
      </InputContainer>

      {i18n.textGranularityEnabled && motivation.get() !== "painting" ? (
        <TextGranularityEditor
          focusId={textGranularity.focusId()}
          value={textGranularity.get()}
          onChange={(e) => textGranularity.set(e)}
        />
      ) : null}
    </>
  );
}
