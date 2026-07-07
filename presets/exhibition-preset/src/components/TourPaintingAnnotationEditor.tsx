import { ActionButton, DeleteIcon, EditTextIcon } from "@manifest-editor/components";
import { useGenericEditor, useLayoutActions } from "@manifest-editor/shell";
import { useRef, useState } from "react";
import { useAnnotation, useAnnotationPage, useCanvas, useVault } from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";
import { normalizeSummaryForSave } from "../right-panels/summary-html";
import { useSlideshowContentPositioning, useSlideshowWorkbenchState } from "../slideshow-content-positioning";
import { TourStepLabelSummaryForm, TourStepLabelSummaryPreview } from "./TourStepHtmlForm";
import { TourStepSideControl } from "./TourStepSideControl";

export function TourPaintingAnnotationEditor({
  editAlignment = false,
  originalAnnotationId,
  highlightProps,
  useSlideshowWorkbench = false,
}: {
  editAlignment?: boolean;
  originalAnnotationId?: string;
  highlightProps: any;
  useSlideshowWorkbench?: boolean;
}) {
  const page = useAnnotationPage();
  const pageEditor = useGenericEditor(page);
  const annotation = useAnnotation();
  const canvas = useCanvas();
  const vault = useVault();
  const { edit } = useLayoutActions();
  const [isOpen, setIsOpen] = useState(false);
  const labelRef = useRef(getLanguageMapText(annotation?.label));
  const summaryRef = useRef(getLanguageMapText(annotation?.summary));
  const selectTourStep = useSlideshowContentPositioning((state) => state.selectTourStep);
  const startTourStepRepositioning = useSlideshowContentPositioning((state) => state.startTourStepRepositioning);
  const requestWorkbenchTab = useSlideshowWorkbenchState((state) => state.requestTab);
  const setShowTourSteps = useSlideshowWorkbenchState((state) => state.setShowTourSteps);
  const paintingPage = canvas?.items?.[0];
  const annotationIndex =
    paintingPage?.id && annotation?.id
      ? (vault.get(paintingPage as any)?.items || []).findIndex((item: any) => item.id === annotation.id)
      : -1;

  const deleteAnnotation = () => {
    if (originalAnnotationId && confirm("Are you sure you want to delete this annotation?")) {
      // Delete the original annotation.
      const index = pageEditor.structural.items
        .getWithoutTracking()
        .findIndex((item) => item.id === originalAnnotationId);
      pageEditor.structural.items.deleteAtIndex(index);
    }
  };
  const showInSlideshowWorkbench = () => {
    if (originalAnnotationId) {
      selectTourStep(originalAnnotationId);
    }

    if (!useSlideshowWorkbench || !originalAnnotationId) {
      return false;
    }

    setShowTourSteps(true);
    startTourStepRepositioning(originalAnnotationId);
    requestWorkbenchTab("tour");
    return true;
  };
  const saveStepText = () => {
    if (!annotation) return;
    vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "label", {
      en: [labelRef.current],
    });
    vault.modifyEntityField(
      { id: annotation.id, type: "Annotation" },
      "summary",
      normalizeSummaryForSave({ en: [summaryRef.current] }),
    );
  };

  return (
    <div
      {...highlightProps}
      className="exhibition-tour-step-card border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative"
      onClick={showInSlideshowWorkbench}
    >
      <div className="flex gap-2 mb-2 p-3">
        <div className="flex-1 min-w-0">
          {isOpen ? (
            <div className="flex flex-col gap-3">
              <TourStepLabelSummaryForm
                label={labelRef.current}
                summary={summaryRef.current}
                onChange={({ label, summary }) => {
                  labelRef.current = label;
                  summaryRef.current = summary;
                }}
              />
            </div>
          ) : (
            <TourStepLabelSummaryPreview
              label={getLanguageMapText(annotation?.label)}
              summary={getLanguageMapText(annotation?.summary)}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 p-2" onClick={(e) => e.stopPropagation()}>
        {isOpen ? (
          <ActionButton
            primary
            onPress={() => {
              saveStepText();
              setIsOpen(false);
            }}
          >
            <CheckIcon /> Finish editing
          </ActionButton>
        ) : (
          <ActionButton onPress={() => setIsOpen(true)}>
            <EditTextIcon /> Edit
          </ActionButton>
        )}

        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>

        <ActionButton
          onPress={() => {
            if (showInSlideshowWorkbench()) {
              return;
            }

            if (!annotation) {
              return;
            }

            edit(
              { id: annotation.id, type: "Annotation" },
              paintingPage
                ? {
                    parent: paintingPage,
                    property: "items",
                    index: annotationIndex,
                  }
                : undefined,
              { forceOpen: true },
            );
          }}
        >
          Edit annotation
        </ActionButton>

        {editAlignment ? (
          <div className="ml-auto flex items-center">
            <TourStepSideControl annotation={annotation} />
          </div>
        ) : null}
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}

function getLanguageMapText(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.find((item) => typeof item === "string") || "";
  const values = value.en || Object.values(value)[0];
  return Array.isArray(values) ? values.find((item) => typeof item === "string") || "" : "";
}
