import {
  ActionButton,
  DeleteIcon,
  EditTextIcon,
  HTMLAnnotationBodyRender,
  TargetIcon,
} from "@manifest-editor/components";
import { HTMLAnnotationEditor, useAnnotationEditor } from "@manifest-editor/editors";
import { useState } from "react";
import { CheckIcon } from "../icons/CheckIcon";

export function TourNormalAnnotationEditor({ highlightProps }: { highlightProps: any }) {
  const { isPending, cancelRequest, busy, requestAnnotationFromTarget, deleteAnnotation } = useAnnotationEditor();

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
            <EditTextIcon /> Edit body
          </ActionButton>
        )}
        {!isOpen ? (
          isPending ? (
            <ActionButton onPress={cancelRequest}>Discard changes</ActionButton>
          ) : (
            <ActionButton className="gap-2 flex" isDisabled={busy} onPress={requestAnnotationFromTarget}>
              <TargetIcon /> Edit region
            </ActionButton>
          )
        ) : null}
        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}
