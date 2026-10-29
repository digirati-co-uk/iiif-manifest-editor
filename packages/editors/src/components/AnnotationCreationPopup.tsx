import { useTranslations } from "@manifest-editor/i18n";
import { TargetIcon } from "@manifest-editor/components";
import { BaseAnnotationCreator, useAtlasStore, useConfig } from "@manifest-editor/shell";
import { ModalCloseIcon } from "@manifest-editor/ui/madoc/components/ModalButton";
import { Button, ToggleButton, ToggleButtonGroup } from "react-aria-components";
import {
  polygonToTarget,
  useAnnotationPage,
  useCanvas,
  useCurrentAnnotationActions,
  useCurrentAnnotationRequest,
} from "react-iiif-vault";
import { useStore } from "zustand";
import { AnnotationPopUpSwitcherButton } from "./AnnotationPopUpSwitcherButton";

const modeButtonClass = ({ isSelected, isFocusVisible }: { isSelected: boolean; isFocusVisible: boolean }) =>
  [
    "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium outline-none",
    isSelected ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
    isFocusVisible ? "ring-2 ring-me-primary-500" : "",
  ].join(" ");

function PanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden className="h-3.5 w-3.5">
      <path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z" />
    </svg>
  );
}

export function AnnotationCreationPopup({
  annotationPageId,
  canvasId,
}: {
  annotationPageId: string;
  canvasId: string;
}) {
  const t = useTranslations("editors");
  const store = useAtlasStore();
  const mode = useStore(store, (s) => s.mode);
  const changeMode = useStore(store, (s) => s.changeMode);
  const { cancelRequest, saveAnnotation } = useCurrentAnnotationActions();
  const { editorFeatureFlags } = useConfig();
  const shape = useStore(store, (state) => state.polygon);
  const { annotationPopups } = editorFeatureFlags;
  const fullCanvas = useCanvas({ id: canvasId });

  // @todo disabled for now, always show.
  // if (!annotationPopups) {
  //   return (
  //     <div className="flex gap-2">
  //       <ActionButton primary onPress={() => saveAnnotation()}>
  //         <CheckIcon /> Finish editing
  //       </ActionButton>
  //       <AnnotationPopUpSwitcherButton />
  //     </div>
  //   );
  // }

  return (
    <div className="w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-2 border-b border-gray-100 py-2 pl-4 pr-2">
        <h2 className="flex-1 truncate text-sm font-semibold text-gray-900">{t("ui.newAnnotation")}</h2>
        <ToggleButtonGroup
          aria-label={t("ui.canvasInteraction")}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode === "explore" ? "explore" : "sketch"]}
          onSelectionChange={(keys) => {
            const next = [...keys][0];
            if (next) changeMode(next as "explore" | "sketch");
          }}
          className="flex rounded-md bg-gray-100 p-0.5"
        >
          <ToggleButton id="sketch" className={modeButtonClass} aria-label={t("ui.editTarget")}>
            <TargetIcon aria-hidden className="h-4 w-4" />
            {t("ui.target")}
          </ToggleButton>
          <ToggleButton id="explore" className={modeButtonClass} aria-label={t("ui.panAndZoom")}>
            <PanIcon />
            {t("ui.pan")}
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          aria-label={t("ui.cancelAnnotation")}
          onPress={() => cancelRequest()}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 outline-none hover:bg-gray-100 hover:text-gray-900 data-[focus-visible]:ring-2 data-[focus-visible]:ring-me-primary-500"
        >
          <ModalCloseIcon className="text-xl" />
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
            getSerialisedSelector: () => (shape ? polygonToTarget(shape, fullCanvas) : undefined),
            motivation: "tagging", // @todo.
            on: { width: fullCanvas?.width, height: fullCanvas?.height },
          },
        }}
      />
    </div>
  );
}
