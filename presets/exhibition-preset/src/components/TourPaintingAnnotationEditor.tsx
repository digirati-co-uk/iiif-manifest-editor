import { ActionButton, DeleteForeverIcon, DeleteIcon } from "@manifest-editor/components";
import { LanguageMapEditor } from "@manifest-editor/editors";
import { ListEditIcon } from "@manifest-editor/manifest-preset/components";
import { useGenericEditor, useLayoutActions } from "@manifest-editor/shell";
import { CloseIcon } from "@manifest-editor/ui/madoc/components/icons/CloseIcon";
import { useState } from "react";
import { LocaleString, useAnnotation, useAnnotationPage } from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";
import { EditIcon } from "./TourNormalAnnotationEditor";

export function TourPaintingAnnotationEditor({
  originalAnnotationId,
  highlightProps,
}: {
  originalAnnotationId?: string;
  highlightProps: any;
}) {
  const page = useAnnotationPage();
  const pageEditor = useGenericEditor(page);
  const annotation = useAnnotation();
  const { edit } = useLayoutActions();
  const [isOpen, setIsOpen] = useState(false);

  const deleteAnnotation = () => {
    if (originalAnnotationId && confirm("Are you sure you want to delete this annotation?")) {
      // Delete the original annotation.
      const index = pageEditor.structural.items
        .getWithoutTracking()
        .findIndex((item) => item.id === originalAnnotationId);
      pageEditor.structural.items.deleteAtIndex(index);
    }
  };

  return (
    <div {...highlightProps} className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative">
      <div className="flex gap-2 mb-2 p-3">
        <div className="flex-1 min-w-0">
          {isOpen ? (
            <>
              <h3 className="text-lg font-semibold border-b pt-1 pb-2 mb-2">Edit step</h3>
              <LanguageMapEditor dispatchType="label" />
              <LanguageMapEditor dispatchType="summary" />
            </>
          ) : (
            <>
              <LocaleString
                as="div"
                defaultText={(<span className="opacity-50">Untitled</span>) as any}
                className="whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden"
              >
                {annotation?.label}
              </LocaleString>
              <LocaleString className="text-gray-500 text-sm bg-white line-clamp-2" as="div">
                {annotation?.label}
              </LocaleString>
            </>
          )}
        </div>
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

        <ActionButton onPress={() => edit(annotation!)}>Edit annotation</ActionButton>

        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}
