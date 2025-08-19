import { ActionButton, CheckIcon } from "@manifest-editor/components";
import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import {
  polygonToTarget,
  useAnnotationPage,
  useCanvas,
  useCurrentAnnotationActions,
  useCurrentAnnotationRequest,
} from "react-iiif-vault";
import { ModalCloseIcon } from "../../../ui/madoc/components/Modal";
import {
  BaseAnnotationCreator,
  useAtlasStore,
  useConfig,
} from "@manifest-editor/shell";
import { AnnotationPopUpSwitcherButton } from "./AnnotationPopUpSwitcherButton";
import { useStore } from "zustand";

export function AnnotationCreationPopup({
  annotationPageId,
  canvasId,
}: {
  annotationPageId: string;
  canvasId: string;
}) {
  const store = useAtlasStore();
  const mode = useStore(store, (s) => s.mode);
  const changeMode = useStore(store, (s) => s.changeMode);
  const { cancelRequest, saveAnnotation } = useCurrentAnnotationActions();
  const { editorFeatureFlags } = useConfig();
  const shape = useStore(store, (state) => state.polygon);
  const { annotationPopups } = editorFeatureFlags;
  const fullCanvas = useCanvas({ id: canvasId });

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
    <div className="bg-white rounded shadow-xl w-[420px]">
      <div className="flex items-center p-1 gap-2">
        <div className="flex-1 px-2">New annotation</div>

        {/*<div>Color</div>*/}
        <div>
          {mode === "explore" ? (
            <ActionButton onPress={() => changeMode("sketch")}>
              Edit target
            </ActionButton>
          ) : (
            <ActionButton onPress={() => changeMode("explore")}>
              Pan and zoom
            </ActionButton>
          )}
        </div>
        <Button
          onPress={() => cancelRequest()}
          className="bg-white hover:bg-gray-100 p-1 rounded-sm"
        >
          <ModalCloseIcon className="text-2xl" />
        </Button>
      </div>

      <BaseAnnotationCreator
        onCreate={() => saveAnnotation()}
        resource={{
          property: "items",
          type: "Annotation",
          isPainting: false,
          parent: {
            id: annotationPageId,
            type: "AnnotationPage",
          },
          target: { id: canvasId, type: "Canvas" },
          initialData: {
            showEmptyForm: true,
            getSerialisedSelector: () =>
              shape ? polygonToTarget(shape) : undefined, // @todo
            motivation: "describing", // @todo.
            on: { width: fullCanvas?.width, height: fullCanvas?.height },
          },
        }}
      />
    </div>
  );
}
