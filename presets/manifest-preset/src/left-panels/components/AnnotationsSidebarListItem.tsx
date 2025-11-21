import {
  ActionButton,
  CheckIcon,
  DeleteIcon,
  EditTextIcon,
  HTMLAnnotationBodyRender,
} from "@manifest-editor/components";
import { HTMLAnnotationEditor, useAnnotationEditor, useAnnotationInfo } from "@manifest-editor/editors";
import { useLayoutActions } from "@manifest-editor/shell";
import { useState } from "react";
import { AnnotationContext } from "react-iiif-vault";
import { RenderPaintingAnnotationPreview } from "./RenderPaintingAnnotationPreview";

export function AnnotationsSidebarListItem() {
  const { isPending, cancelRequest, busy, requestAnnotationFromTarget, deleteAnnotation } = useAnnotationEditor();
  const [annotation, { highlightProps, annotationTarget }] = useAnnotationInfo();
  const { edit } = useLayoutActions();

  const isBodyEmpty = !annotation || annotation.body.length === 0;

  const [isOpen, setIsOpen] = useState(false);
  // This is an annotatino within a page.
  return (
    <div {...highlightProps} className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative">
      <div className="relative">
        {annotationTarget ? (
          <AnnotationContext annotation={annotationTarget}>
            <RenderPaintingAnnotationPreview />
          </AnnotationContext>
        ) : isBodyEmpty ? (
          <div className="flex items-center justify-center px-4 py-6 text-gray-400 text-sm">
            This annotation has no body.
          </div>
        ) : isOpen ? (
          <HTMLAnnotationEditor className="border-none" />
        ) : (
          <HTMLAnnotationBodyRender className="px-3 pt-3 line-clamp-3 prose-p:text-slate-600" locale="en" />
        )}
      </div>
      <div className="flex gap-2 p-2">
        {annotationTarget ? (
          <ActionButton
            onPress={() => edit({ id: annotationTarget, type: "Annotation" }, undefined, { forceOpen: true })}
          >
            Edit painting annotation
          </ActionButton>
        ) : isOpen && isPending ? (
          <ActionButton
            primary
            onPress={() => {
              setIsOpen(false);
              cancelRequest();
            }}
          >
            <CheckIcon /> Finish editing
          </ActionButton>
        ) : (
          <ActionButton
            isDisabled={busy}
            onPress={() => {
              setIsOpen(true);
              requestAnnotationFromTarget().then(() => {
                setIsOpen(false);
              });
            }}
          >
            <EditTextIcon /> {isBodyEmpty ? "Edit target" : "Edit"}
          </ActionButton>
        )}
        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>
      </div>
    </div>
  );
}
