import {
  ActionButton,
  DeleteIcon,
  EditTextIcon,
  HTMLAnnotationBodyRender,
} from "@manifest-editor/components";
import {
  AnnotationPopUpSwitcherButton,
  HTMLAnnotationEditor,
  useAnnotationEditor,
} from "@manifest-editor/editors";
import { useContext, useEffect, useState } from "react";
import { CheckIcon } from "../icons/CheckIcon";
import { ResourceEditingReactContext, useConfig } from "@manifest-editor/shell";
import {
  AnnotationContext,
  useAnnotation,
  useCurrentAnnotationActions,
} from "react-iiif-vault";
import { ActionButtonPopupSwitcher } from "./ActionButtonPopupSwitcher";

export function TourNormalAnnotationEditor({
  highlightProps,
}: {
  highlightProps: any;
}) {
  const value = useContext(ResourceEditingReactContext);
  const annotation = useAnnotation();
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;

  const {
    isPending,
    cancelRequest,
    busy,
    requestAnnotationFromTarget,
    deleteAnnotation,
  } = useAnnotationEditor({
    annotationPopup: (
      <AnnotationContext annotation={annotation!.id}>
        <ResourceEditingReactContext.Provider value={value}>
          <TourAnnotationPopupEditor />
        </ResourceEditingReactContext.Provider>
      </AnnotationContext>
    ),
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !isPending) {
      setIsOpen(true);
    }
  }, [isPending, isOpen]);

  // This is an annotatino within a page.
  return (
    <div
      {...highlightProps}
      className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative"
    >
      <div className="relative">
        {isOpen && !annotationPopups ? (
          <HTMLAnnotationEditor className="border-none" />
        ) : (
          <HTMLAnnotationBodyRender
            className="px-3 pt-3 line-clamp-3 prose-p:text-slate-600"
            locale="en"
          />
        )}
      </div>
      <div className="flex gap-2 p-2">
        {isOpen && isPending ? (
          <>
            <ActionButton
              primary
              onPress={() => {
                setIsOpen(false);
                cancelRequest();
              }}
            >
              <CheckIcon /> Finish editing
            </ActionButton>
            <AnnotationPopUpSwitcherButton />
          </>
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
            <EditTextIcon /> Edit
          </ActionButton>
        )}
        <ActionButton className="gap-2 flex" onPress={() => deleteAnnotation()}>
          <DeleteIcon /> Delete
        </ActionButton>
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}

function TourAnnotationPopupEditor() {
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const { saveAnnotation } = useCurrentAnnotationActions();

  if (!annotationPopups) {
    return (
      <div className="flex gap-2">
        <ActionButton primary onPress={() => saveAnnotation()}>
          <CheckIcon /> Finish editing
        </ActionButton>
        <AnnotationPopUpSwitcherButton />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="prose-headings:mt-1 overflow-hidden rounded prose-headings:mb-1 prose-sm focus-within:ring-1 focus-within:ring-me-primary-500">
        <HTMLAnnotationEditor className="border-none" />
      </div>

      <div className="flex gap-2 p-2">
        <ActionButton
          primary
          onPress={() => {
            saveAnnotation();
          }}
        >
          <CheckIcon /> Finish editing
        </ActionButton>
        <ActionButtonPopupSwitcher />
      </div>
    </div>
  );
}
