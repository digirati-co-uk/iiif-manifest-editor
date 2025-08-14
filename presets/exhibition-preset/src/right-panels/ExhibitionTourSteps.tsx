import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, Sidebar, SidebarContent } from "@manifest-editor/components";
import { PromptToAddPaintingAnnotations } from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useConfig,
  useCreator,
  useGenericEditor,
  useInlineCreator,
} from "@manifest-editor/shell";
import { useState } from "react";
import { Button } from "react-aria-components";
import { AnnotationPageContext, useCanvas, useRequestAnnotation } from "react-iiif-vault";
import { TourAnnotationPageEditor } from "../components/TourAnnotationPageEditor";
import { getGridStats } from "../helpers";
import { ExhibitionTourStepPopup } from "./ExhibitionTourStepPopup";

export const exhibitionTourSteps: EditorDefinition = {
  id: "@exhibition/tour-steps",
  supports: {
    edit: true,
    properties: ["annotations"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      const full = vault.get(resource);
      const stats = getGridStats(full.behavior);

      if (full.type === "Canvas" && !stats.isInfo) {
        return true;
      }
      return false;
    },
  },
  label: "Tour steps",
  component: () => <ExhibitionRightPanelOptionalPage />,
};

function ExhibitionRightPanelOptionalPage() {
  const canvas = useCanvas();
  const firstAnnotationPage = canvas?.annotations[0];
  const itemsAnnotationPage = canvas?.items[0];

  // @todo create annotation page?
  if (!firstAnnotationPage || !canvas || !itemsAnnotationPage) {
    return <PromptCreationOfTourSteps />;
  }

  return <ExhibitionRightPanel />;
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

function ExhibitionRightPanel() {
  const canvas = useCanvas();
  const firstAnnotationPage = canvas?.annotations[0];
  const itemsAnnotationPage = canvas?.items[0];
  const editor = useGenericEditor(firstAnnotationPage);
  const creator = useInlineCreator();
  const [reorderable, setReorderable] = useState(false);

  const { requestAnnotation, isPending, busy, cancelRequest, completeRequest } = useRequestAnnotation({
    onSuccess: (resp) => {
      const bodyValue = resp.metadata.bodyValue || "";

      if (!resp.cancelled && resp.target && firstAnnotationPage) {
        creator.create(
          "@manifest-editor/html-annotation",
          {
            label: { en: ["Tour step"] },
            body: { en: [bodyValue || "<h2>New step</h2><p>Description</p>"] },
            motivation: "describing",
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
              selector:
                resp.target.type === "SvgSelector"
                  ? {
                      type: "polygon",
                      shape: resp.polygon,
                    }
                  : resp.boundingBox,
            },
          },
        );
      }
    },
  });

  if (!canvas) return null;
  if (!firstAnnotationPage) {
    return <div>No annotation page - create one?</div>;
  }

  return (
    <Sidebar>
      <SidebarContent padding>
        <div className="flex gap-4 border-b pt-4 pb-2 mb-2">
          <h2 className="text-lg font-semibold flex-1">Tour steps</h2>
          <ActionButton onPress={() => setReorderable((r) => !r)}>{reorderable ? "Done" : "Reorder"}</ActionButton>
        </div>

        <ResourceEditingProvider resource={canvas}>
          <AnnotationPageContext annotationPage={firstAnnotationPage.id}>
            <div className="flex flex-col gap-4">
              <TourAnnotationPageEditor reorderable={reorderable} />

              {!busy ? (
                isPending ? (
                  <div className="border grid grid-cols-2 gap-2 disabled:opacity-50 border-gray-300 shadow-sm rounded p-1 bg-white relative text-black/40">
                    <Button onPress={cancelRequest} className="text-black/80 rounded-sm p-3">
                      Cancel
                    </Button>
                    <Button onPress={completeRequest} className="bg-me-100 text-me-500 rounded-sm p-3">
                      Save changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    onPress={() => requestAnnotation({ type: "box", annotationPopup: <ExhibitionTourStepPopup /> })}
                    className="border disabled:opacity-50 border-gray-300 hover:border-me-500 hover:bg-me-50 cursor-pointer shadow-sm rounded p-4 bg-white relative text-black/40 hover:text-me-500"
                  >
                    + Add new step
                  </Button>
                )
              ) : null}
            </div>
            {itemsAnnotationPage /*&& hasMultiplePainting*/ ? (
              <>
                <h3 className="text-md border-b pt-4 pb-2 mb-2">Available tour steps from images</h3>
                <PromptToAddPaintingAnnotations
                  painting={itemsAnnotationPage}
                  page={editor.ref()}
                  canvasId={canvas.id}
                />
              </>
            ) : null}
          </AnnotationPageContext>
        </ResourceEditingProvider>
      </SidebarContent>
    </Sidebar>
  );
}
