import { useEditingResource, useEditingResourceStack } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { CanvasContext } from "react-iiif-vault";
import { CanvasPanelViewer } from "@/_panels/center-panels/CanvasPanelViewer/CanvasPanelViewer";
import { useEffect, useState } from "react";

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
      <CanvasContext canvas={canvasId} key={canvasId}>
        <CanvasPanelViewer
          highlightAnnotation={annotationId}
          onEditAnnotation={(id: string) => id !== annotationId && edit({ id, type: "Annotation" })}
          createAnnotation={createAnnotation}
        />
      </CanvasContext>
    );
  }
  return <div>No canvas selected</div>;
}
