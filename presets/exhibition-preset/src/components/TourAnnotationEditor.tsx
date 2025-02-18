import { useAnnotationInfo } from "@manifest-editor/editors";
import { ResourceEditingProvider } from "@manifest-editor/shell";
import { useMemo } from "react";
import { AnnotationContext } from "react-iiif-vault";
import { TourNormalAnnotationEditor } from "./TourNormalAnnotationEditor";
import { TourPaintingAnnotationEditor } from "./TourPaintingAnnotationEditor";

export function TourAnnotationEditor() {
  const [annotation, { annotationTarget, highlightProps }] =
    useAnnotationInfo();

  const resource = useMemo(() => {
    if (annotationTarget) {
      return { id: annotationTarget, type: "Annotation" };
    }
    return { id: annotation?.id as string, type: "Annotation" };
  }, [annotation?.id, annotationTarget]);

  if (annotationTarget) {
    return (
      <ResourceEditingProvider resource={resource}>
        <AnnotationContext annotation={annotationTarget}>
          <TourPaintingAnnotationEditor
            originalAnnotationId={annotation?.id}
            highlightProps={highlightProps}
          />
        </AnnotationContext>
      </ResourceEditingProvider>
    );
  }

  return (
    <ResourceEditingProvider resource={resource}>
      <TourNormalAnnotationEditor highlightProps={highlightProps} />
    </ResourceEditingProvider>
  );
}
