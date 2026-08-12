import { useGenericEditor } from "@manifest-editor/shell";
import { useCallback } from "react";
import { useAnnotation, useAnnotationPage, useCanvas, useRequestAnnotation } from "react-iiif-vault/presentation-4";

export function useAnnotationEditor({
  annotationPopup,
  bounds: inputBounds,
}: { annotationPopup?: React.ReactNode; bounds?: { x: number; y: number; width: number; height: number } } = {}) {
  const annotation = useAnnotation();
  const canvas = useCanvas();
  const editor = useGenericEditor(annotation);
  const pageEditor = useGenericEditor(useAnnotationPage());
  const target = editor.annotation.target.getParsedSelector();
  const { requestAnnotation, isPending, cancelRequest, busy } = useRequestAnnotation({
    onSuccess: (resp) => {
      if (resp.target) {
        console.log("success!", resp.target);
        editor.annotation.target.setSelector(resp.target);
      }
    },
  });

  const bounds = inputBounds || (canvas ? { x: 0, y: 0, width: canvas.width, height: canvas.height } : null);

  // Request Annotation selector correctly.
  // oxlint-disable react/exhaustive-deps -- Changing popup and bounds is not supported during a request.
  const requestAnnotationFromTarget = useCallback(
    function requestAnnotationFromTarget() {
      if (target) {
        if (target.type === "SvgSelector") {
          return requestAnnotation({
            type: "polygon",
            open: false,
            points: target.points,
            annotationPopup,
            bounds,
          });
        }

        if (target.type === "PointSelector") {
          return requestAnnotation({
            type: "polygon",
            open: true,
            points: target.points,
            annotationPopup,
            bounds,
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
            bounds,
          });
        }
      }
      return requestAnnotation({ type: "polygon", open: true, points: [], annotationPopup, bounds });
    },
    [target, requestAnnotation]
  );
  // oxlint-enable react/exhaustive-deps

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
