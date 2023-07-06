import { useEditingResource, useEditingResourceStack, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { CanvasContext, useVaultSelector } from "react-iiif-vault";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";
import { EmptyState } from "@/madoc/components/EmptyState";

export function useInStack(type: string) {
  const stack = useEditingResourceStack();
  const current = useEditingResource();

  return current?.resource.source.type === type ? current : stack.find((t) => t.resource.source.type === type);
}

export function CanvasPanelEditor() {
  const { edit, create } = useLayoutActions();
  const canvas = useInStack("Canvas");
  const annotationPage = useInStack("AnnotationPage");
  const annotation = useInStack("Annotation");
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
    createAnnotation = (data: any) => {
      create({
        type: "Annotation",
        parent: { id: annotationPageId as string, type: "AnnotationPage" },
        property: "items",
        initialData: { selector: data, motivation: "describing" },
        target: { id: canvasId, type: "Canvas" },
      });
    };
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
