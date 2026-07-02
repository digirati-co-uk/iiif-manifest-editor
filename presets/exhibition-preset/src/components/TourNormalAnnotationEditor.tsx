import {
  ActionButton,
  DeleteIcon,
  EditTextIcon,
} from "@manifest-editor/components";
import {
  AnnotationPopUpSwitcherButton,
  useAnnotationEditor,
} from "@manifest-editor/editors";
import { ResourceEditingReactContext, useConfig } from "@manifest-editor/shell";
import { useContext, useEffect, useRef, useState } from "react";
import {
  AnnotationContext,
  useAnnotation,
  useCurrentAnnotationActions,
  useVault,
} from "react-iiif-vault";
import { CheckIcon } from "../icons/CheckIcon";
import {
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import { ActionButtonPopupSwitcher } from "./ActionButtonPopupSwitcher";
import { TourStepHtmlForm, TourStepHtmlPreview } from "./TourStepHtmlForm";
import { TourStepBorderPicker } from "./TourStepBorderPicker";

export function TourNormalAnnotationEditor({
  highlightProps,
  useSlideshowWorkbench = false,
}: {
  highlightProps: any;
  useSlideshowWorkbench?: boolean;
}) {
  const value = useContext(ResourceEditingReactContext);
  const annotation = useAnnotation();
  const vault = useVault();
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const body = getFirstTextualBody(annotation?.body || [], vault);
  const bodyValueRef = useRef(body?.resource?.value || "");
  const startTourStepRepositioning = useSlideshowContentPositioning(
    (state) => state.startTourStepRepositioning,
  );
  const requestWorkbenchTab = useSlideshowWorkbenchState(
    (state) => state.requestTab,
  );
  const setShowTourSteps = useSlideshowWorkbenchState(
    (state) => state.setShowTourSteps,
  );

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
  const showInSlideshowWorkbench = () => {
    if (!useSlideshowWorkbench || !annotation?.id) {
      return false;
    }

    setShowTourSteps(true);
    startTourStepRepositioning(annotation.id);
    requestWorkbenchTab("tour");
    return true;
  };

  useEffect(() => {
    if (!isOpen) {
      bodyValueRef.current = body?.resource?.value || "";
    }
  }, [body?.resource?.value, isOpen]);

  useEffect(() => {
    if (isOpen && !isPending) {
      setIsOpen(true);
    }
  }, [isPending, isOpen]);

  // This is an annotation within a page.
  return (
    <div
      {...highlightProps}
      className="exhibition-tour-step-card border border-gray-300 hover:border-me-500 shadow-sm rounded bg-white relative"
      onClick={showInSlideshowWorkbench}
    >
      <div className="relative">
        {isOpen && !annotationPopups ? (
          <div className="p-3">
            <TourStepHtmlForm
              value={body?.resource?.value || ""}
              onChange={(nextValue) => (bodyValueRef.current = nextValue)}
            />
          </div>
        ) : (
          <div className="px-3 pt-3">
            <TourStepHtmlPreview value={body?.resource?.value || ""} />
          </div>
        )}
      </div>
      <div className="flex gap-2 p-2" onClick={(e) => e.stopPropagation()}>
        {isOpen && isPending ? (
          <>
            <ActionButton
              primary
              onPress={() => {
                saveTourStepBody(vault, annotation, body, bodyValueRef.current);
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
              if (useSlideshowWorkbench && annotation?.id) {
                setShowTourSteps(true);
                startTourStepRepositioning(annotation.id);
                requestWorkbenchTab("tour");
              }

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
        <div className="ml-auto flex items-center">
          <TourStepBorderPicker />
        </div>
      </div>
      <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
    </div>
  );
}

function TourAnnotationPopupEditor() {
  const { editorFeatureFlags } = useConfig();
  const { annotationPopups } = editorFeatureFlags;
  const { saveAnnotation } = useCurrentAnnotationActions();
  const annotation = useAnnotation();
  const vault = useVault();
  const body = getFirstTextualBody(annotation?.body || [], vault);
  const bodyValueRef = useRef(body?.resource?.value || "");

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
    <div className="bg-white shadow-md rounded-lg relative max-h-[50vh] overflow-y-auto">
      <div className="prose-headings:mt-1 rounded prose-headings:mb-1 prose-sm focus-within:ring-1 focus-within:ring-me-primary-500 p-3">
        <TourStepHtmlForm
          value={body?.resource?.value || ""}
          onChange={(nextValue) => (bodyValueRef.current = nextValue)}
        />
      </div>

      <div className="flex gap-2 p-2 sticky bottom-0 z-50 bg-white">
        <ActionButton
          primary
          onPress={() => {
            saveTourStepBody(vault, annotation, body, bodyValueRef.current);
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

function getFirstTextualBody(
  bodies: any[],
  vault: any,
): { ref: any; resource: any; bodyIndex: number } | null {
  for (let bodyIndex = 0; bodyIndex < bodies.length; bodyIndex++) {
    const body = bodies[bodyIndex];
    const resource = resolveBody(body, vault);
    if (
      resource?.type === "TextualBody" ||
      resource?.type === "Text" ||
      resource?.format === "text/html"
    ) {
      return {
        ref: body?.id ? { id: body.id, type: "ContentResource" } : null,
        resource,
        bodyIndex,
      };
    }
  }
  return null;
}

function resolveBody(body: any, vault: any) {
  if (!body?.id || body.value) return body;
  return vault.get(body as any, { skipSelfReturn: false } as any) || body;
}

function saveTourStepBody(
  vault: any,
  annotation: any,
  body: ReturnType<typeof getFirstTextualBody>,
  value: string,
) {
  if (!annotation || !body) return;

  if (body.ref?.id) {
    vault.modifyEntityField(body.ref, "value", value);
    return;
  }

  const bodies = Array.isArray(annotation.body) ? annotation.body : [];
  vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "body", [
    ...bodies.slice(0, body.bodyIndex),
    { ...body.resource, value },
    ...bodies.slice(body.bodyIndex + 1),
  ]);
}
