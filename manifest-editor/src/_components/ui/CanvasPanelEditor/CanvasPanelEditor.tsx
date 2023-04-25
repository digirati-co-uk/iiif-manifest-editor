import { useEditingResource, useEditingResourceStack, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { CanvasContext, useVaultSelector } from "react-iiif-vault";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";

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

  const totalAnnotations = useVaultSelector(
    (state, vault) => {
      if (canvasId) {
        const c = vault.get(canvasId);
        console.log({ c });
        const page = c.items[0];
        if (page) {
          const fullPage = vault.get(page);
          if (fullPage) {
            return fullPage.items.length;
          }
        }
      }
      return 0;
    },
    [canvasId]
  );

  if (annotationPage && canvas && annotationPage.parent?.id === canvasId && annotationPage.property === "annotations") {
    createAnnotation = (data: any) => {
      create({
        type: "Annotation",
        parent: { id: annotationPage.resource.source.id as string, type: "AnnotationPage" },
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
          key={`${canvasId}/${totalAnnotations}`}
          highlightAnnotation={annotationId}
          onEditAnnotation={(id: string) => id !== annotationId && edit({ id, type: "Annotation" })}
          createAnnotation={createAnnotation}
        />
      </CanvasContext>
    );
  }
  return <div>No canvas selected</div>;
}
