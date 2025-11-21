import {
  ActionButton,
  HTMLEditor,
  DeleteIcon,
  TargetIcon,
} from "@manifest-editor/components";
import { useAtlasStore, useConfig } from "@manifest-editor/shell";
import {
  useCurrentAnnotationActions,
  useCurrentAnnotationMetadata,
} from "react-iiif-vault";
import { useStore } from "zustand";
import { CheckIcon } from "../icons/CheckIcon";
import { DEFAULT_TOUR_STEP_HTML } from "./ExhibitionTourStepPopup";
import { AnnotationPopUpSwitcherButton } from "@manifest-editor/editors";

export function PendingTourStepAnnotation() {
  const store = useAtlasStore();
  const polygon = useStore(store, (s) => s.polygon);
  const [metadata, setMetadata] = useCurrentAnnotationMetadata();
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const { cancelRequest, saveAnnotation } = useCurrentAnnotationActions();

  return (
    <div className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative">
      <div className="bg-me-primary-500 text-white p-2 m-1 rounded flex gap-2">
        <TargetIcon />
        Draw a box on the canvas
      </div>
      {annotationPopups ? (
        <div className="relative p-3 line-clamp-3 prose-p:text-slate-600">
          <div className="prose-headings:mt-1 prose-headings:mb-1 prose-sm">
            <div
              dangerouslySetInnerHTML={{
                __html: metadata.bodyValue || DEFAULT_TOUR_STEP_HTML,
              }}
            />
          </div>
        </div>
      ) : (
        <HTMLEditor
          className="border-none"
          value={metadata.bodyValue || DEFAULT_TOUR_STEP_HTML}
          onChange={(newValue) => setMetadata({ bodyValue: newValue })}
        />
      )}
      <div className="flex gap-2 p-3">
        <ActionButton
          isDisabled={polygon?.points.length === 0}
          onPress={() => saveAnnotation()}
        >
          <CheckIcon /> Finish editing
        </ActionButton>

        <ActionButton className="gap-2 flex" onPress={() => cancelRequest()}>
          <DeleteIcon /> Delete
        </ActionButton>

        <AnnotationPopUpSwitcherButton />
      </div>
    </div>
  );
}
