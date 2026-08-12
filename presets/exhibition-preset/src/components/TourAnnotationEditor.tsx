import { useAnnotationInfo } from "@manifest-editor/editors";
import { ResourceEditingProvider } from "@manifest-editor/shell";
import { useMemo } from "react";
import { AnnotationContext } from "react-iiif-vault/presentation-4";
import { TourNormalAnnotationEditor } from "./TourNormalAnnotationEditor";
import { TourPaintingAnnotationEditor } from "./TourPaintingAnnotationEditor";

export function TourAnnotationEditor({
  editAlignment = false,
  index = 0,
  tourStyle = "linear",
  useSlideshowWorkbench = false,
}: {
  editAlignment?: boolean;
  index?: number;
  tourStyle?: "linear" | "non-linear";
  useSlideshowWorkbench?: boolean;
}) {
  const [annotation, { annotationTarget, highlightProps }] = useAnnotationInfo();

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
            index={index}
            tourStyle={tourStyle}
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
        index={index}
        tourStyle={tourStyle}
        useSlideshowWorkbench={useSlideshowWorkbench}
      />
    </ResourceEditingProvider>
  );
}
