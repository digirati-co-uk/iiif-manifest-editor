import { useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useVaultSelector, CanvasContext, useVault } from "react-iiif-vault";
import { useInStack } from "../../helpers";
import { CanvasPanelViewer } from "../CanvasPanelViewer/CanvasPanelViewer";

export function CanvasPanelEditor() {
  const { edit, create } = useLayoutActions();
  const canvas = useInStack("Canvas");
  const annotationPage = useInStack("AnnotationPage");
  const annotation = useInStack("Annotation");
  const vault = useVault();

  const canvasId = canvas?.resource.source.id;
  let createAnnotation = undefined;
  const annotationPageId =
    annotationPage && canvas && annotationPage.parent?.id === canvasId && annotationPage.property === "annotations"
      ? annotationPage.resource.source.id
      : undefined;

  const totalAnnotations = useVaultSelector(
    (state, vault) => {
      if (canvasId) {
        const c = vault.get(canvasId);
        if (c && c.items) {
          const page = c.items[0];
          if (page) {
            const fullPage = vault.get(page);
            if (fullPage) {
              return fullPage.items.length;
            }
          }
        }
      }
      return 0;
    },
    [canvasId]
  );

  if (annotationPageId) {
    const fullCanvas = vault.get({ id: canvasId, type: "Canvas" });
    if (fullCanvas) {
      createAnnotation = (data: any) => {
        create({
          type: "Annotation",
          parent: { id: annotationPageId as string, type: "AnnotationPage" },
          property: "items",
          initialData: {
            selector: data,
            motivation: "describing",
            on: { width: fullCanvas.width, height: fullCanvas.height },
          },
          target: { id: canvasId, type: "Canvas" },
        });
      };
    }
  }

  const annotationId = annotation?.resource?.source.id;

  if (canvas) {
    return (
      <CanvasContext canvas={canvasId}>
        <CanvasPanelViewer
          key={`${canvasId}/${totalAnnotations}/${annotationPageId}`}
          highlightAnnotation={annotationId}
          onEditAnnotation={(id: string) => id !== annotationId && edit({ id, type: "Annotation" })}
          createAnnotation={createAnnotation}
        />
      </CanvasContext>
    );
  }
  return <EmptyState>No canvas selected</EmptyState>;
}
