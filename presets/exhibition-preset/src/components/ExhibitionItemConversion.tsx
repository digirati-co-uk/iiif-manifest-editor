import { getValue } from "@iiif/helpers";
import { ActionButton } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";

export function ExhibitionItemConversion() {
  const editor = useEditor();

  const applyDefaultSettings = () => {
    const canvasWidth = editor.technical.width.get();
    const canvasHeight = editor.technical.height.get();
    const summary = editor.descriptive.summary;
    const behaviors = editor.technical.behavior;

    const behaviorsToAdd = behaviors.get();
    behaviorsToAdd.push("w-12");

    const height = Math.max(1, Math.min(12, Math.round((canvasWidth / canvasHeight) * 12)));
    behaviorsToAdd.push(`h-${height}`);
    // Implementation of applying default settings
    // 1. Add behavior of "w-12"
    // 2. Add behavior of "h-1" to "h-12" based on canvas height
    // 3. Add an empty summary
    if (!getValue(summary.get())) {
      summary.set({ en: ["Summary of image"] });
    }

    editor.technical.behavior.set(behaviorsToAdd);
  };

  return (
    <div className="flex flex-col items-center gap-4 border-me-100 border-2 p-4 rounded">
      This canvas was not created in the exhibition editor. Do you want to apply default settings?
      <ActionButton onPress={() => applyDefaultSettings()}>Apply defaults</ActionButton>
    </div>
  );
}
