import { HTMLEditor, ActionButton } from "@manifest-editor/components";
import { useCurrentAnnotationActions, useCurrentAnnotationMetadata } from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";

export function ExhibitionTourStepPopup() {
  const { saveAnnotation } = useCurrentAnnotationActions();
  const [metadata, setMetadata] = useCurrentAnnotationMetadata();

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="prose-headings:mt-1 overflow-hidden rounded prose-headings:mb-1 prose-sm focus-within:ring-1 focus-within:ring-me-primary-500">
        <HTMLEditor
          className="border-none"
          value={metadata.bodyValue || "<h2>New step</h2><p>Description</p>"}
          onChange={(newValue) => setMetadata({ bodyValue: newValue })}
        />
      </div>

      <div className="flex gap-2 p-3">
        <ActionButton onPress={() => saveAnnotation()}>
          <CheckIcon /> Finish editing
        </ActionButton>
      </div>
    </div>
  );
}
