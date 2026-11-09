import { getCanvasLayout } from "@manifest-editor/editor-api";
import { useLayoutActions } from "@manifest-editor/shell";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useEffect } from "react";
import { CanvasContext, useManifest, useVaultSelector } from "react-iiif-vault";
import { useInStack } from "../../helpers";
import { CanvasPanelViewer } from "../CanvasPanelViewer/CanvasPanelViewer";

export function CanvasPanelEditor({ asFallback = false, moveMode, enableAddMedia }: { asFallback?: boolean; moveMode?: boolean; enableAddMedia?: boolean }) {
  const { edit, create } = useLayoutActions();
  const canvas = useInStack("Canvas");
  const annotationPage = useInStack("AnnotationPage");
  const annotation = useInStack("Annotation");
  const manifest = useManifest();

  const canvasId = canvas?.resource.source.id;
  const hasLayout = useVaultSelector((_, vault) => !!(canvasId && getCanvasLayout(vault, canvasId)), [canvasId]);
  const firstCanvasId = manifest?.items?.[0]?.id;
  let createAnnotation = undefined;
  const annotationPageId =
    annotationPage && canvas && annotationPage.parent?.id === canvasId && annotationPage.property === "annotations"
      ? annotationPage.resource.source.id
      : undefined;

  const annotationId = annotation?.resource?.source.id;

  useEffect(() => {
    if (!canvas && firstCanvasId) {
      edit({ id: firstCanvasId, type: "Canvas" }, undefined, {
        forceOpen: false,
      });
    }
  }, [canvas, edit, firstCanvasId]);

  if (canvas) {
    return (
      <CanvasContext canvas={canvasId}>
        <CanvasPanelViewer
          asFallback={asFallback}
          enableAddMedia={enableAddMedia}
          moveMode={moveMode ?? (hasLayout && !annotationId)}
          key={`${canvasId}/${annotationPageId}`}
          highlightAnnotation={annotationId}
          onEditAnnotation={(id: string) => id !== annotationId && edit({ id, type: "Annotation" })}
          createAnnotation={createAnnotation}
        />
      </CanvasContext>
    );
  }
  return <EmptyState>No canvas selected</EmptyState>;
}
