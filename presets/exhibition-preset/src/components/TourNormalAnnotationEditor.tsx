import { ActionButton, DeleteForeverIcon } from "@manifest-editor/components";
import { ListEditIcon } from "@manifest-editor/manifest-preset/components";
import { useGenericEditor } from "@manifest-editor/shell";
import { CloseIcon } from "@manifest-editor/ui/madoc/components/icons/CloseIcon";
import { useState } from "react";
import { useAnnotation, useAnnotationPage, useRequestAnnotation } from "react-iiif-vault";
import { HTMLAnnotationBodyRender } from "./HTMLAnnotationBodyRender";
import { HTMLAnnotationEditor } from "./HTMLAnnotationEditor";

export function TourNormalAnnotationEditor({ highlightProps }: { highlightProps: any }) {
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
  function requestAnnotationFromTarget() {
    if (target) {
      if (target.type === "SvgSelector") {
        return requestAnnotation({
          type: "polygon",
          open: false,
          points: target.points,
        });
      }

      if (target.type === "PointSelector") {
        return requestAnnotation({
          type: "polygon",
          open: true,
          points: target.points,
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
        });
      }
    }
    return requestAnnotation({ type: "polygon", open: true, points: [] });
  }

  const deleteAnnotation = () => {
    if (annotation && confirm("Are you sure you want to delete this annotation?")) {
      // Delete the original annotation.
      const index = pageEditor.structural.items.getWithoutTracking().findIndex((item) => item.id === annotation.id);
      pageEditor.structural.items.deleteAtIndex(index);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  // This is an annotatino within a page.
  return (
    <div
      {...highlightProps}
      className="border border-gray-300 p-3 hover:border-me-500 shadow-sm rounded bg-white relative"
    >
      <div className="absolute top-1 right-1 z-20 flex gap-2">
        <ActionButton onPress={() => deleteAnnotation()}>
          <DeleteForeverIcon />
        </ActionButton>
        <ActionButton onPress={() => setIsOpen((o) => !o)}>{isOpen ? <CloseIcon /> : <ListEditIcon />}</ActionButton>
      </div>
      <div className="mb-2 relative">
        {isOpen ? (
          <>
            <h3 className="text-lg font-semibold border-b pt-1 pb-2 mb-2">Edit step</h3>
            <HTMLAnnotationEditor />
          </>
        ) : (
          <>
            <HTMLAnnotationBodyRender className="line-clamp-3 prose-p:text-slate-600" locale="en" />
          </>
        )}
        {!isOpen ? (
          <div>
            {isPending ? (
              <ActionButton onPress={cancelRequest}>Discard changes</ActionButton>
            ) : (
              <ActionButton isDisabled={busy} onPress={requestAnnotationFromTarget}>
                Edit region
              </ActionButton>
            )}
          </div>
        ) : null}
      </div>
      <div className="absolute -bottom-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}
