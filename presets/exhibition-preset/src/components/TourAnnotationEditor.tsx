import { useAnnotationInfo } from "@manifest-editor/editors";
import { ResourceEditingProvider } from "@manifest-editor/shell";
import { useMemo } from "react";
import { AnnotationContext } from "react-iiif-vault";
import { TourNormalAnnotationEditor } from "./TourNormalAnnotationEditor";
import { TourPaintingAnnotationEditor } from "./TourPaintingAnnotationEditor";

export function TourAnnotationEditor({
  editAlignment = false,
  useSlideshowWorkbench = false,
}: {
  editAlignment?: boolean;
  useSlideshowWorkbench?: boolean;
}) {
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
            editAlignment={editAlignment}
            originalAnnotationId={annotation?.id}
            highlightProps={highlightProps}
            useSlideshowWorkbench={useSlideshowWorkbench}
          />
        </AnnotationContext>
      </ResourceEditingProvider>
    );
  }

  return (
    <ResourceEditingProvider resource={resource}>
      <TourNormalAnnotationEditor
        editAlignment={editAlignment}
        highlightProps={highlightProps}
        useSlideshowWorkbench={useSlideshowWorkbench}
      />
    </ResourceEditingProvider>
  );
}
