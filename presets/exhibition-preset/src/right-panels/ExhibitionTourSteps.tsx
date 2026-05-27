import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, Sidebar, SidebarContent } from "@manifest-editor/components";
import { PromptToAddPaintingAnnotations } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider, useInlineCreator } from "@manifest-editor/shell";
import { useState } from "react";
import { Button } from "react-aria-components";
import { AnnotationPageContext, useCanvas, useRequestAnnotation } from "react-iiif-vault";
import { ExhibitionTourStepPopup } from "../components/ExhibitionTourStepPopup";
import { PendingTourStepAnnotation } from "../components/PendingTourStepAnnotation";
import { TourAnnotationPageEditor } from "../components/TourAnnotationPageEditor";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import { useSlideshowContentPositioning, useSlideshowWorkbenchState } from "../slideshow-content-positioning";

type EditingMode = "simple" | "advanced";

export const exhibitionTourSteps: EditorDefinition = {
  id: "@exhibition/tour-steps",
  supports: {
    edit: true,
    properties: ["annotations"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource, vault)) return false;
      // Tour steps are not supported for textual-content (info box) canvases.
      return !isInfoBoxCanvas(resource, vault);
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
  const firstAnnotationPage = canvas?.annotations?.[0];
  const itemsAnnotationPage = canvas?.items?.[0];
  const creator = useInlineCreator();
  const [reorderable, setReorderable] = useState(false);
  const setShowTourSteps = useSlideshowWorkbenchState((state) => state.setShowTourSteps);
  const stopContentRepositioning = useSlideshowContentPositioning((state) => state.stopRepositioning);
  const stopTextRepositioning = useSlideshowContentPositioning((state) => state.stopTextRepositioning);
  const { requestAnnotation, isPending, busy } = useRequestAnnotation({
    onSuccess: (resp) => {
      const bodyValue = resp.metadata.bodyValue || "";

      if (!resp.cancelled && resp.target && firstAnnotationPage) {
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

  if (!canvas) return null;
  if (!firstAnnotationPage) {
    return <PromptCreationOfTourSteps />;
  }

  const showPaintingAnnotations = mode === "advanced" && Boolean(itemsAnnotationPage);
  const createSlideshowWorkbenchStep = () => {
    const annotationWidth = Math.round((canvas.width || 1920) * 0.3);
    const annotationHeight = Math.round((canvas.height || 1080) * 0.3);
    const annotationX = Math.round((canvas.width || 1920) * 0.1);
    const annotationY = Math.round((canvas.height || 1080) * 0.1);

    creator.create(
      "@manifest-editor/html-annotation",
      {
        label: { en: ["Tour step"] },
        body: { en: ["<h2>New step</h2><p>Description</p>"] },
        motivation: "tagging",
      },
      {
        target: { id: canvas.id, type: "Canvas" },
        targetType: "Annotation",
        parent: {
          property: "items",
          resource: {
            id: firstAnnotationPage.id,
            type: "AnnotationPage",
          },
        },
        initialData: {
          getSerialisedSelector: () => ({
            type: "FragmentSelector",
            value: `xywh=${annotationX},${annotationY},${annotationWidth},${annotationHeight}`,
          }),
        },
      },
    );
    setShowTourSteps(true);
    stopContentRepositioning();
    stopTextRepositioning();
  };

  return (
    <>
      <div className="flex gap-4 border-b pt-4 pb-2 mb-2">
        <h2 className="text-lg font-semibold flex-1">Tour steps</h2>
        {mode === "advanced" ? (
          <ActionButton onPress={() => setReorderable((r) => !r)}>{reorderable ? "Done" : "Reorder"}</ActionButton>
        ) : null}
      </div>

      <ResourceEditingProvider resource={canvas}>
        <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
          <div className="flex flex-col gap-4">
            <TourAnnotationPageEditor
              reorderable={mode === "advanced" ? reorderable : false}
              useSlideshowWorkbench={useSlideshowWorkbench}
            />

            {useSlideshowWorkbench ? (
              <Button
                onPress={createSlideshowWorkbenchStep}
                className="border disabled:opacity-50 border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500"
              >
                + Add new step
              </Button>
            ) : !busy ? (
              isPending ? (
                <PendingTourStepAnnotation />
              ) : (
                <Button
                  onPress={() =>
                    requestAnnotation({
                      type: "box",
                      annotationPopup: <ExhibitionTourStepPopup />,
                    })
                  }
                  className="border disabled:opacity-50 border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500"
                >
                  + Add new step
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
