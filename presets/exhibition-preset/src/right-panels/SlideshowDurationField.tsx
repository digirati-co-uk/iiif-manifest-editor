import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { useEditor, usePresetTemplateSelection } from "@manifest-editor/shell";

export function SlideshowDurationField() {
  const { selectedTemplate } = usePresetTemplateSelection();
  const editor = useEditor();
  const duration = editor.technical.duration;

  if (selectedTemplate?.type !== "slideshow" || editor.technical.type !== "Canvas") {
    return null;
  }

  return (
    <InputContainer $wide id={duration.containerId()}>
      <InputLabel htmlFor={duration.focusId()}>Slide duration</InputLabel>
      <Input
        id={duration.focusId()}
        min={0}
        type="number"
        value={duration.get() || 0}
        onChange={(event) => {
          const value = event.currentTarget.valueAsNumber;
          if (Number.isFinite(value)) duration.set(value);
        }}
      />
    </InputContainer>
  );
}
