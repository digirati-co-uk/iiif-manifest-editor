import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { useApp, useEditor } from "@manifest-editor/shell";
import { useExhibitionTemplate } from "../helpers/exhibition-template";

export function SlideshowDurationField() {
  const selectedTemplate = useExhibitionTemplate();
  const app = useApp();
  const editor = useEditor();
  const duration = editor.technical.duration;

  const isSlideshow = selectedTemplate
    ? selectedTemplate.type === "slideshow"
    : app.metadata.id === "exhibition-slideshow-editor";
  if (!isSlideshow || editor.technical.type !== "Canvas") {
    return null;
  }

  return (
    <InputContainer $wide id={duration.containerId()}>
      <InputLabel htmlFor={duration.focusId()}>Slide duration (seconds)</InputLabel>
      <Input
        id={duration.focusId()}
        min={0}
        type="number"
        step="any"
        placeholder="5"
        value={duration.get() || ""}
        onChange={(event) => {
          const value = event.currentTarget.value === "" ? 0 : event.currentTarget.valueAsNumber;
          if (Number.isFinite(value) && value >= 0) duration.set(value);
        }}
      />
    </InputContainer>
  );
}
