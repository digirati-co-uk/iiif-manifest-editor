import {
  ActionButton,
  DeleteIcon,
  EditTextIcon,
} from "@manifest-editor/components";
import { useAnnotationEditor } from "@manifest-editor/editors";
import { useEffect, useRef, useState } from "react";
import { useAnnotation, useVault } from "react-iiif-vault/presentation-4";
import { CheckIcon } from "../icons/CheckIcon";
import {
  useSlideshowContentPositioning,
  useSlideshowWorkbenchState,
} from "../slideshow-content-positioning";
import { TourStepHtmlForm, TourStepHtmlPreview } from "./TourStepHtmlForm";
import { TourStepBorderPicker } from "./TourStepBorderPicker";
import { TourStepSideControl } from "./TourStepSideControl";

export function TourNormalAnnotationEditor({
  editAlignment = false,
  highlightProps,
  index = 0,
  tourStyle = "linear",
  useSlideshowWorkbench = false,
}: {
  editAlignment?: boolean;
  highlightProps: any;
  index?: number;
  tourStyle?: "linear" | "non-linear";
  useSlideshowWorkbench?: boolean;
}) {
  const annotation = useAnnotation();
  const vault = useVault();
  const body = getFirstTextualBody(annotation?.body || [], vault);
  const bodyValueRef = useRef(body?.resource?.value || "");
  const startTourStepRepositioning = useSlideshowContentPositioning(
    (state) => state.startTourStepRepositioning,
  );
  const selectTourStep = useSlideshowContentPositioning(
    (state) => state.selectTourStep,
  );
  const requestWorkbenchTab = useSlideshowWorkbenchState(
    (state) => state.requestTab,
  );
  const setShowTourSteps = useSlideshowWorkbenchState(
    (state) => state.setShowTourSteps,
  );

  const {
    target,
    isPending,
    cancelRequest,
    busy,
    requestAnnotationFromTarget,
    deleteAnnotation,
  } = useAnnotationEditor();
  const invalidRegion = !target;

  const [isOpen, setIsOpen] = useState(false);
  const showInSlideshowWorkbench = () => {
    if (annotation?.id) {
      selectTourStep(annotation.id);
    }

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
      className={`exhibition-tour-step-card border shadow-sm rounded bg-white relative ${
        tourStyle === "non-linear"
          ? "border-gray-900 hover:border-black"
          : "border-gray-300 hover:border-me-500"
      }`}
      onClick={showInSlideshowWorkbench}
    >
      <div
        className="absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-semibold"
        style={{ backgroundColor: "#f5f5f5", color: "#b84c74" }}
      >
        {tourStyle === "non-linear"
          ? `Point ${index + 1}`
          : `Step ${index + 1}`}
      </div>
      <div className="relative">
        {invalidRegion ? (
          <div className="mx-3 mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Invalid region. Select Edit to draw a new region.
          </div>
        ) : null}
        {isOpen ? (
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
        <div className="ml-auto flex items-center gap-2">
          {editAlignment ? (
            <TourStepSideControl annotation={annotation} />
          ) : null}
          <TourStepBorderPicker />
        </div>
      </div>
      {tourStyle === "linear" ? (
        <div className="absolute -bottom-5 left-5 h-5 border-l-2 border-gray-300 w-0" />
      ) : null}
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
