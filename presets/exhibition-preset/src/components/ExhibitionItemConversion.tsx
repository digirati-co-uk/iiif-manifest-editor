import { ActionButton } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import {
  needsExhibitionSummary,
  withExhibitionDefaults,
} from "./exhibition-item-defaults";

export function ExhibitionItemConversion({
  misplacedSplash = false,
}: {
  misplacedSplash?: boolean;
}) {
  const editor = useEditor();

  const applyDefaultSettings = () => {
    const canvasWidth = editor.technical.width.get();
    const canvasHeight = editor.technical.height.get();
    const summary = editor.descriptive.summary;
    const behaviors = editor.technical.behavior;

    const currentBehaviors = behaviors.get();
    const defaultBehaviors = withExhibitionDefaults(
      misplacedSplash
        ? currentBehaviors.filter((behavior) => behavior !== "splash")
        : currentBehaviors,
      canvasWidth,
      canvasHeight,
    );

    if (needsExhibitionSummary(summary.get())) {
      summary.set({ en: ["Summary of image"] });
    }

    if (
      defaultBehaviors.length !== currentBehaviors.length ||
      defaultBehaviors.some(
        (behavior, index) => behavior !== currentBehaviors[index],
      )
    ) {
      behaviors.set(defaultBehaviors);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 border-me-100 border-2 p-4 rounded">
      {misplacedSplash
        ? "Opening cover canvases must be first. Apply defaults to use this canvas as a regular exhibition slide."
        : "This canvas was not created in the exhibition editor. Do you want to apply default settings?"}
      <ActionButton onPress={() => applyDefaultSettings()}>
        Apply defaults
      </ActionButton>
    </div>
  );
}
