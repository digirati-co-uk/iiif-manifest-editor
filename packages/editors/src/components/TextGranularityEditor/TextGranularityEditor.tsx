import { TextGranularityOptions } from "@iiif/presentation-3";
import { InputContainer, InputLabel } from "../Input";
import { InlineSelect } from "../../form-elements/InlineSelect/InlineSelect";

interface TextGranularityEditorProps {
  focusId?: string;
  value: TextGranularityOptions | undefined;
  onChange: (newValue: TextGranularityOptions | undefined) => void;
}

export function TextGranularityEditor({ focusId, onChange, value }: TextGranularityEditorProps) {
  return (
    <InputContainer $fluid>
      <InputLabel htmlFor={focusId}>Text granularity</InputLabel>
      <InlineSelect<TextGranularityOptions>
        onDeselect={() => onChange(undefined)}
        value={value}
        onChange={onChange}
        name={focusId}
        id={focusId}
        options={[
          {
            label: { en: ["Whole Page"] },
            value: "page",
          },
          {
            label: { en: ["Region of text"] },
            value: "block",
          },
          {
            label: { en: ["Paragraph"] },
            value: "paragraph",
          },
          {
            label: { en: ["Topographic line"] },
            value: "line",
          },
          {
            label: { en: ["Single word"] },
            value: "word",
          },
          {
            label: { en: ["Single glyph"] },
            value: "glyph",
          },
        ]}
      />
    </InputContainer>
  );
}
