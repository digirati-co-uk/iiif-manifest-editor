import { useGenericEditor } from "@manifest-editor/shell";
import { useCallback } from "react";
import { useAnnotation, useAnnotationPage, useRequestAnnotation } from "react-iiif-vault";

export function useAnnotationEditor({ annotationPopup }: { annotationPopup?: React.ReactNode } = {}) {
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation);
  const pageEditor = useGenericEditor(useAnnotationPage());
  const target = editor.annotation.target.getParsedSelector();
  const { requestAnnotation, isPending, cancelRequest, busy } = useRequestAnnotation({
    onSuccess: (resp) => {
      if (resp.target) {
        editor.annotation.target.setSelector(resp.target);
      }
    },
  });
  // Request Annotation selector correctly.
  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't support changing it.
  const requestAnnotationFromTarget = useCallback(
    function requestAnnotationFromTarget() {
      if (target) {
        if (target.type === "SvgSelector") {
          return requestAnnotation({
            type: "polygon",
            open: false,
            points: target.points,
            annotationPopup,
          });
        }

        if (target.type === "PointSelector") {
          return requestAnnotation({
            type: "polygon",
            open: true,
            points: target.points,
            annotationPopup,
          });
        }

        if (target.type === "BoxSelector") {
          const p = target.spatial;
          return requestAnnotation({
            type: "box",
            selector: {
              x: p.x,
              y: p.y,
              width: p.width,
              height: p.height,
            },
            selectByDefault: true,
            annotationPopup,
          });
        }
      }
      return requestAnnotation({ type: "polygon", open: true, points: [], annotationPopup });
    },
    [target, requestAnnotation],
  );

  const deleteAnnotation = useCallback(() => {
    if (annotation && confirm("Are you sure you want to delete this annotation?")) {
      // Delete the original annotation.
      const index = pageEditor.structural.items.getWithoutTracking().findIndex((item) => item.id === annotation.id);
      pageEditor.structural.items.deleteAtIndex(index);
    }
  }, [annotation, pageEditor]);

  return {
    editor,
    pageEditor,
    target,
    requestAnnotationFromTarget,
    deleteAnnotation,
    requestAnnotation,
    isPending,
    cancelRequest,
    busy,
  };
}
