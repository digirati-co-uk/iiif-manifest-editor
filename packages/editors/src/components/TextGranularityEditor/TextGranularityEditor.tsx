import { useTranslations } from "@manifest-editor/i18n";
import { TextGranularityOptions } from "@iiif/presentation-3";
import { InputContainer, InputLabel } from "../Input";
import { InlineSelect } from "../../form-elements/InlineSelect/InlineSelect";

interface TextGranularityEditorProps {
  focusId?: string;
  value: TextGranularityOptions | undefined;
  onChange: (newValue: TextGranularityOptions | undefined) => void;
}

export function TextGranularityEditor({ focusId, onChange, value }: TextGranularityEditorProps) {
  const t = useTranslations("editors");
  return (
    <InputContainer $fluid>
      <InputLabel htmlFor={focusId}>{t("ui.textGranularity")}</InputLabel>
      <InlineSelect<TextGranularityOptions>
        onDeselect={() => onChange(undefined)}
        value={value}
        onChange={onChange}
        name={focusId}
        id={focusId}
        options={[
          {
            label: { en: [t("ui.wholePage")] },
            value: "page",
          },
          {
            label: { en: [t("ui.regionOfText")] },
            value: "block",
          },
          {
            label: { none: [t("ui.paragraph")] },
            value: "paragraph",
          },
          {
            label: { en: [t("ui.topographicLine")] },
            value: "line",
          },
          {
            label: { en: [t("ui.singleWord")] },
            value: "word",
          },
          {
            label: { en: [t("ui.singleGlyph")] },
            value: "glyph",
          },
        ]}
      />
    </InputContainer>
  );
}
