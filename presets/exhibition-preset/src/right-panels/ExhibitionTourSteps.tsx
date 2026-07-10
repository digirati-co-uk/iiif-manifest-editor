import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, Sidebar, SidebarContent } from "@manifest-editor/components";
import { PromptToAddPaintingAnnotations } from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useApp,
  useEditor,
  useInlineCreator,
  usePresetTemplateSelection,
} from "@manifest-editor/shell";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { AnnotationPageContext, useCanvas, useRequestAnnotation } from "react-iiif-vault";
import { PendingTourStepAnnotation } from "../components/PendingTourStepAnnotation";
import { TourAnnotationPageEditor } from "../components/TourAnnotationPageEditor";
import { isEditableExhibitionCanvas, isInfoBoxCanvas, isVideoCanvas } from "../helpers";
import { useExhibitionTemplate } from "../helpers/exhibition-template";
import { useSlideshowContentPositioning, useSlideshowWorkbenchState } from "../slideshow-content-positioning";
import { nonLinearTourBehavior, tourMarkerPinBehavior } from "../tour-behaviors";
import { hasFloatingBehavior, resolveExhibitionTemplateType, SimpleCheckbox } from "./SlideBehaviours";


type EditingMode = "simple" | "advanced";

export const exhibitionTourSteps: EditorDefinition = {
  id: "@exhibition/tour-steps",
  supports: {
    edit: true,
    properties: ["annotations", "behavior"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      // Tour steps are supported for image canvases only.
      return !isInfoBoxCanvas(resource as any, vault) && !isVideoCanvas(resource as any, vault);
    },
  },
  label: "Tour steps",
  component: () => <ExhibitionTourStepsPanel />,
};

export function ExhibitionTourStepsPanel({ mode = "advanced" }: { mode?: EditingMode }) {
  const canvas = useCanvas();
  const firstAnnotationPage = canvas?.annotations[0];
  const itemsAnnotationPage = canvas?.items[0];

  // @todo create annotation page?
  if (!firstAnnotationPage || !canvas || !itemsAnnotationPage) {
    return <PromptCreationOfTourSteps />;
  }

  return (
    <Sidebar>
      <SidebarContent padding>
        <ExhibitionTourStepsContent mode={mode} />
      </SidebarContent>
    </Sidebar>
  );
}

function PromptCreationOfTourSteps() {
  const canvas = useCanvas();
  const creator = useInlineCreator();

  const createEmptyAnnotationPage = () => {
    if (!canvas) return;
    creator.create(
      "@manifest-editor/empty-annotation-page",
      {
        label: { en: ["Tour steps"] },
      },
      {
        target: {
          id: canvas.id,
          type: "Canvas",
        },
        targetType: "AnnotationPage",
        parent: {
          property: "annotations",
          resource: {
            id: canvas.id,
            type: "Canvas",
          },
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="p-4 opacity-50 text-center">This image does not yet have a tour.</div>

      <Button
        className="border w-full disabled:opacity-50 border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500"
        onPress={() => createEmptyAnnotationPage()}
      >
        Create Tour
      </Button>
    </div>
  );
}

export function ExhibitionTourStepsContent({
  mode,
  useSlideshowWorkbench = false,
}: {
  mode: EditingMode;
  useSlideshowWorkbench?: boolean;
}) {
  const canvas = useCanvas();
  const editor = useEditor();
  const firstAnnotationPage = canvas?.annotations?.[0];
  const itemsAnnotationPage = canvas?.items?.[0];
  const [reorderable, setReorderable] = useState(false);
  const [editAlignment, setEditAlignment] = useState(false);
  const app = useApp();
  const selectedTemplate = useExhibitionTemplate();
  const templateType = resolveExhibitionTemplateType(selectedTemplate?.type, app.metadata.id);
  const canvasBehavior = Array.isArray(canvas?.behavior) ? canvas.behavior : [];
  const canEditAlignment = templateType === "scroll" || hasFloatingBehavior(canvasBehavior);
  const setShowTourSteps = useSlideshowWorkbenchState((state) => state.setShowTourSteps);
  const setCenterPanelMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const stopContentRepositioning = useSlideshowContentPositioning((state) => state.stopRepositioning);
  const stopTextRepositioning = useSlideshowContentPositioning((state) => state.stopTextRepositioning);

  useEffect(() => {
    setShowTourSteps(true);
    setCenterPanelMode("edit");
    stopContentRepositioning();
    stopTextRepositioning();
  }, [setCenterPanelMode, setShowTourSteps, stopContentRepositioning, stopTextRepositioning]);
  const { requestTourStep, isPending, busy } = useTourStepAnnotationRequest({
    onBeforeRequest: useSlideshowWorkbench
      ? () => {
          setShowTourSteps(true);
          setCenterPanelMode("edit");
          stopContentRepositioning();
          stopTextRepositioning();
        }
      : undefined,
  });
  const toggleEditAlignment = () => {
    setEditAlignment((value) => {
      const nextValue = !value;
      setCenterPanelMode(nextValue ? "preview" : "edit");
      return nextValue;
    });
  };

  if (!canvas) return null;
  if (!firstAnnotationPage) {
    return <PromptCreationOfTourSteps />;
  }

  const showPaintingAnnotations = mode === "advanced" && Boolean(itemsAnnotationPage);
  const behavior = editor.technical.type === "Canvas" ? editor.technical.behavior.get() || [] : [];
  const nonLinear = behavior.includes(nonLinearTourBehavior);
  const markerStyle = behavior.includes(tourMarkerPinBehavior) ? "pin" : "circle";
  const tourStyle = nonLinear ? "non-linear" : "linear";
  const setNonLinearTour = (nextNonLinear: boolean) => {
    if (editor.technical.type !== "Canvas") return;
    const next = behavior.filter((item) => item !== nonLinearTourBehavior);
    editor.technical.behavior.set(nextNonLinear ? [...next, nonLinearTourBehavior] : next);
  };
  const setMarkerStyle = (nextMarkerStyle: "circle" | "pin") => {
    if (editor.technical.type !== "Canvas") return;
    const next = behavior.filter((item) => item !== tourMarkerPinBehavior);
    editor.technical.behavior.set(nextMarkerStyle === "pin" ? [...next, tourMarkerPinBehavior] : next);
  };

  return (
    <>
      <div className="flex gap-4 border-b pt-4 pb-2 mb-2">
        <h2 className="text-lg font-semibold flex-1">Tour steps</h2>
        {mode === "advanced" && !nonLinear ? (
          <ActionButton onPress={() => setReorderable((r) => !r)}>{reorderable ? "Done" : "Reorder"}</ActionButton>
        ) : null}
        {mode === "advanced" && canEditAlignment ? (
          <ActionButton onPress={toggleEditAlignment}>{editAlignment ? "Done" : "Edit alignment"}</ActionButton>
        ) : null}
      </div>

      <div className="mb-4 rounded border border-gray-200 bg-white p-3">
        <div className="mb-2 text-sm font-semibold text-gray-700">Tour style</div>
        <SimpleCheckbox checked={nonLinear} label="Use non-linear map" onChange={setNonLinearTour} />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Shows all tour steps as markers on the canvas. Visitors can open points in any order instead of moving through
          a fixed step sequence.
        </p>
        {nonLinear ? (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-700">Marker</div>
              <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
                <MarkerStyleButton selected={markerStyle === "circle"} onPress={() => setMarkerStyle("circle")}>
                  Circle
                </MarkerStyleButton>
                <MarkerStyleButton selected={markerStyle === "pin"} onPress={() => setMarkerStyle("pin")}>
                  Pin
                </MarkerStyleButton>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Marker colour follows the exhibition theme annotation text colour.
            </p>
          </div>
        ) : null}
      </div>

      <ResourceEditingProvider resource={canvas}>
        <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold text-gray-700">{nonLinear ? "Map points" : "Linear step list"}</div>
            <TourAnnotationPageEditor
              reorderable={mode === "advanced" && !nonLinear ? reorderable : false}
              tourStyle={tourStyle}
              editAlignment={canEditAlignment && editAlignment}
              useSlideshowWorkbench={useSlideshowWorkbench}
            />

            {!busy ? (
              isPending ? (
                <PendingTourStepAnnotation />
              ) : (
                <Button
                  onPress={requestTourStep}
                  className="border disabled:opacity-50 border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500"
                >
                  {nonLinear ? "+ Add map point" : "+ Add new step"}
                </Button>
              )
            ) : null}
          </div>
          {showPaintingAnnotations && itemsAnnotationPage ? (
            <>
              <PromptToAddPaintingAnnotations
                title={<h3 className="text-md border-b pt-4 pb-2 mb-2">Available tour steps from images</h3>}
                painting={itemsAnnotationPage}
                page={firstAnnotationPage}
                canvasId={canvas.id}
              />
            </>
          ) : null}
        </AnnotationPageContext>
      </ResourceEditingProvider>
    </>
  );
}

function MarkerStyleButton({
  children,
  selected,
  onPress,
}: {
  children: ReactNode;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
        selected ? "bg-white text-me-primary-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
      }`}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

export function useTourStepAnnotationRequest({
  onBeforeRequest,
}: { onBeforeRequest?: () => void } = {}) {
  const canvas = useCanvas();
  const firstAnnotationPage = canvas?.annotations?.[0];
  const creator = useInlineCreator();
  const { requestAnnotation, isPending, busy } = useRequestAnnotation({
    onSuccess: (resp) => {
      const bodyValue = resp.metadata.bodyValue || "";

      if (!resp.cancelled && resp.target && canvas && firstAnnotationPage) {
        creator.create(
          "@manifest-editor/html-annotation",
          {
            label: { en: ["Tour step"] },
            body: {
              en: [bodyValue || "<h2>New step</h2><p>Description</p>"],
            },
            motivation: "tagging",
          } as {
            label?: InternationalString;
            body: InternationalString;
            motivation?: string;
            height?: number;
            width?: number;
          },
          {
            target: {
              id: canvas.id,
              type: "Canvas",
            },
            targetType: "Annotation",
            parent: {
              property: "items",
              resource: {
                id: firstAnnotationPage.id,
                type: "AnnotationPage",
              },
            },
            initialData: {
              selector: resp,
            },
          },
        );
      }
    },
  });

  const requestTourStep = () => {
    onBeforeRequest?.();
    requestAnnotation({
      type: "box",
    });
  };

  return {
    requestTourStep,
    isPending,
    busy,
    canRequestTourStep: Boolean(canvas && firstAnnotationPage),
  };
}
