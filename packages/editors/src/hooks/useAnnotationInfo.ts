import { isSpecificResource } from "@iiif/parser/presentation-4";
import { useHoverHighlightImageResource } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useAnnotation } from "react-iiif-vault/presentation-4";

export function useAnnotationInfo() {
  const annotation = useAnnotation();
  const highlightProps = useHoverHighlightImageResource(annotation?.id);

  if (!annotation) {
    return [
      null,
      {
        highlightProps: {},
        isValid: false,
        annotationTarget: null,
        firstBody: null,
        item: null,
      },
    ] as const;
  }

  const firstBody = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
  const item = isSpecificResource(firstBody) ? firstBody.source : firstBody;

  const isValid: boolean = !!(item && (item.type === "Image" || item.type === "Sound" || item.type === "Video"));
  const annotationTarget: string | null =
    (annotation as any)?.target.source?.type === "Annotation" ? (annotation as any)?.target.source?.id : null;
  const annotationTargetResource = useMemo(() => {
    if (annotationTarget) {
      return { id: annotationTarget, type: "Annotation" };
    }
    return { id: annotation?.id as string, type: "Annotation" };
  }, [annotation?.id, annotationTarget]);

  return [
    annotation,
    {
      highlightProps,
      isValid,
      annotationTarget,
      annotationTargetResource,
      firstBody,
      item,
    },
  ] as const;
}
