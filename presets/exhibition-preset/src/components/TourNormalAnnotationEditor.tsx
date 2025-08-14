import { ActionButton, DeleteForeverIcon, DeleteIcon, TargetIcon } from "@manifest-editor/components";
import { ListEditIcon } from "@manifest-editor/manifest-preset/components";
import { useGenericEditor } from "@manifest-editor/shell";
import { CloseIcon } from "@manifest-editor/ui/madoc/components/icons/CloseIcon";
import { useState } from "react";
import { useAnnotation, useAnnotationPage, useRequestAnnotation } from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";
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
    <div {...highlightProps} className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative">
      <div className="relative">
        {isOpen ? (
          <HTMLAnnotationEditor className="border-none" />
        ) : (
          <HTMLAnnotationBodyRender className="px-3 pt-3 line-clamp-3 prose-p:text-slate-600" locale="en" />
        )}
      </div>
      <div className="flex gap-2 p-2">
        {isOpen ? (
          <ActionButton onPress={() => setIsOpen(false)}>
            <CheckIcon /> Finish editing
          </ActionButton>
        ) : (
          <ActionButton onPress={() => setIsOpen(true)}>
            <EditIcon /> Edit body
          </ActionButton>
        )}
        {!isOpen ? (
          <>
            {isPending ? (
              <ActionButton onPress={cancelRequest}>Discard changes</ActionButton>
            ) : (
              <ActionButton className="gap-2 flex" isDisabled={busy} onPress={requestAnnotationFromTarget}>
                <TargetIcon /> Edit region
              </ActionButton>
            )}
          </>
        ) : null}
        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}

export function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M14 11c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1h9c.55 0 1 .45 1 1M3 7c0 .55.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1m7 8c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1m8.01-2.13l.71-.71a.996.996 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71zm-.71.71l-5.16 5.16c-.09.09-.14.21-.14.35v1.41c0 .28.22.5.5.5h1.41c.13 0 .26-.05.35-.15l5.16-5.16z"
      />
    </svg>
  );
}
