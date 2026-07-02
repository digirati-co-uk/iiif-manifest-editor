import { ActionButton } from "@manifest-editor/components";
import {
  useCurrentAnnotationActions,
  useCurrentAnnotationMetadata,
} from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";
import { useConfig } from "@manifest-editor/shell";
import { AnnotationPopUpSwitcherButton } from "@manifest-editor/editors";
import { TourStepHtmlForm } from "./TourStepHtmlForm";
import { DEFAULT_TOUR_STEP_HTML } from "./tour-step-html";

export function ExhibitionTourStepPopup() {
  const { saveAnnotation } = useCurrentAnnotationActions();
  const [metadata, setMetadata] = useCurrentAnnotationMetadata();
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;

  if (!annotationPopups) {
    return (
      <div className="flex gap-2">
        <ActionButton primary onPress={() => saveAnnotation()}>
          <CheckIcon /> Finish editing
        </ActionButton>
        <AnnotationPopUpSwitcherButton />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="prose-headings:mt-1 overflow-y-auto rounded prose-headings:mb-1 prose-sm focus-within:ring-1 focus-within:ring-me-primary-500">
        <TourStepHtmlForm
          value={metadata.bodyValue || DEFAULT_TOUR_STEP_HTML}
          onChange={(bodyValue) => setMetadata({ bodyValue })}
        />
      </div>

      <div className="flex gap-2 p-3">
        <ActionButton primary onPress={() => saveAnnotation()}>
          <CheckIcon /> Finish editing
        </ActionButton>
        <AnnotationPopUpSwitcherButton />
      </div>
    </div>
  );
}
