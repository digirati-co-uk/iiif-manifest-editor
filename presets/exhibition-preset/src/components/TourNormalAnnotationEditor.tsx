import {
  ActionButton,
  DeleteIcon,
  EditTextIcon,
  HTMLAnnotationBodyRender,
  TargetIcon,
} from "@manifest-editor/components";
import { HTMLAnnotationEditor, useAnnotationEditor } from "@manifest-editor/editors";
import { useContext, useEffect, useState } from "react";
import { CheckIcon } from "../icons/CheckIcon";
import { ResourceEditingReactContext, useConfig, useSaveConfig } from "@manifest-editor/shell";
import { AnnotationContext, useAnnotation, useCurrentAnnotationActions } from "react-iiif-vault";
import { ActionButtonPopupSwitcher } from "./ActionButtonPopupSwitcher";

export function TourNormalAnnotationEditor({ highlightProps }: { highlightProps: any }) {
  const value = useContext(ResourceEditingReactContext);
  const annotation = useAnnotation();
const { editorFeatureFlags } = useConfig();
  const saveConfig = useSaveConfig();
  const { annotationPopups } = editorFeatureFlags;

  const { isPending, cancelRequest, busy, requestAnnotationFromTarget, deleteAnnotation } = useAnnotationEditor({
    annotationPopup: (
      <AnnotationContext annotation={annotation!.id}>
        <ResourceEditingReactContext.Provider value={value}><TourAnnotationPopupEditor /></ResourceEditingReactContext.Provider></AnnotationContext>

    )
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !isPending) {
      setIsOpen(true);
    }
  }, [isPending, isOpen])

  // This is an annotatino within a page.
  return (
    <div {...highlightProps} className="border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative">
      <div className="relative">
        {isOpen && !annotationPopups ? (
          <HTMLAnnotationEditor className="border-none" />
        ) : (
          <HTMLAnnotationBodyRender className="px-3 pt-3 line-clamp-3 prose-p:text-slate-600" locale="en" />
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
          }}>
            <CheckIcon /> Finish editing
          </ActionButton>
          <ActionButton
            className="ml-auto order-3"
            onPress={ () => saveConfig({ editorFeatureFlags: {...editorFeatureFlags, annotationPopups: annotationPopups ? false : true } })}
          >
            { annotationPopups ? <PopinIcon /> : <PopoutIcon /> }
          </ActionButton>
          </>
        ) : (
          <ActionButton
              isDisabled={busy}
              onPress={() => {
                setIsOpen(true);
                requestAnnotationFromTarget().then(() => {
                  setIsOpen(false);
                })
              }}>
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
  const saveConfig = useSaveConfig();
  const { saveAnnotation } = useCurrentAnnotationActions();


  if (!annotationPopups) {
    return (
      <div className="flex gap-2">
        <ActionButton primary onPress={() => saveAnnotation()}>
          <CheckIcon /> Finish editing
        </ActionButton>
        <ActionButtonPopupSwitcher />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="prose-headings:mt-1 overflow-hidden rounded prose-headings:mb-1 prose-sm focus-within:ring-1 focus-within:ring-me-primary-500">
        <HTMLAnnotationEditor className="border-none" />
      </div>

      <div className="flex gap-2 p-2">
        <ActionButton primary onPress={() => {
          saveAnnotation();
        }}>
          <CheckIcon /> Finish editing
        </ActionButton>
        <ActionButtonPopupSwitcher />
      </div>
    </div>
  );
}



export function PopoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M4 20q-.825 0-1.413-.588T2 18V6q0-.825.588-1.413T4 4h16q.825 0 1.413.588T22 6v5h-2V6H4v12h11v2H4Zm7.075-5.5l1.425-1.425L9.4 10H12V8H6v6h2v-2.575l3.075 3.075ZM17 20v-7h5v7h-5Zm-5-8Z" /></svg>
  )
}


export function PopinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}<path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm9-2V5H5v14z" /></svg>
    )
  }
