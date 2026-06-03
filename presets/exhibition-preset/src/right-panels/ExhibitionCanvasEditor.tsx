import { ArrowRightIcon, Sidebar, SidebarContent } from "@manifest-editor/components";
import { InputContainer, PaintingAnnotationList } from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useEditingResource,
  useEditor,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useEffect, useRef, useState } from "react";
import { AnnotationPageContext, useCanvas, useVault } from "react-iiif-vault";
import { ExhibitionItemConversion } from "../components/ExhibitionItemConversion";
import { isEditableExhibitionCanvas, isExhibitionItem, isInfoBoxCanvas } from "../helpers";
import { supportsTourSteps } from "../slideshow-content-positioning";
import { buildLayoutPresetBehaviors, getLayoutPreset, LayoutPresetCard, layoutPresetOptions } from "./SlideBehaviours";
import { getLanguageMapHtml } from "./summary-html";

export const exhibitionCanvasEditor: EditorDefinition = {
  id: "@exhibition/right-panel-editor",
  supports: {
    edit: true,
    properties: ["label", "summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      // Hide the Exhibition tab for textual-content (info box) canvases.
      return !isInfoBoxCanvas(resource as any, vault);
    },
  },
  label: "Exhibition",
  component: () => <ExhibitionCanvasAdvancedPanel />,
};

export function ExhibitionCanvasAdvancedPanel() {
  return (
    <Sidebar>
      <SidebarContent padding>
        <ExhibitionCanvasAdvancedContent />
      </SidebarContent>
    </Sidebar>
  );
}

export function ExhibitionCanvasAdvancedContent() {
  const canvas = useCanvas();
  const vault = useVault();
  const resource = useEditingResource();
  const { structural, technical } = useEditor();
  const { items } = structural;
  const behavior = technical.behavior.get() || [];
  const pages = items.get();
  const page = pages[0];

  const isAnExhibitionCanvas = isExhibitionItem(canvas);
  const isTextOnly = behavior.includes("info");
  const tourSupported = supportsTourSteps(vault, canvas);

  if (!canvas || !page || !resource) return <div className="p-8">Canvas, page, or resource not found</div>;

  if (isTextOnly) {
    return (
      <ResourceEditingProvider resource={canvas}>
        {!isAnExhibitionCanvas ? <ExhibitionItemConversion /> : null}
        <ReadonlyExhibitionSummary canvas={canvas} />
        {tourSupported ? <TourStepsSummary canvas={canvas} /> : null}
      </ResourceEditingProvider>
    );
  }

  return (
    <ResourceEditingProvider resource={canvas}>
      {!isAnExhibitionCanvas ? <ExhibitionItemConversion /> : null}

      <ReadonlyExhibitionSummary canvas={canvas} />

      <InputContainer $wide>
        <div>
          <div className="exhibition-workbench-muted mb-3 text-sm font-semibold">Layout preset</div>
          <div className="grid grid-cols-2 gap-3">
            {layoutPresetOptions.map((option) => (
              <LayoutPresetCard
                key={option.value}
                preset={option.value}
                label={option.label}
                selected={getLayoutPreset(behavior) === option.value}
                onClick={() => {
                  technical.behavior.set(
                    buildLayoutPresetBehaviors(
                      behavior,
                      option.value,
                      canvas ? { width: canvas.width, height: canvas.height } : undefined,
                    ),
                  );
                }}
              />
            ))}
          </div>
          <EditorTabLink canvas={canvas} tabId="slide-behaviors" label="Edit layout options" />
        </div>
      </InputContainer>

      {tourSupported ? <TourStepsSummary canvas={canvas} /> : null}

      <AnnotationPageContext annotationPage={page.id}>
        <PaintingAnnotationList createFilter="image" />
      </AnnotationPageContext>
    </ResourceEditingProvider>
  );
}

function ReadonlyExhibitionSummary({ canvas }: { canvas: any }) {
  const { edit } = useLayoutActions();
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const label = getLanguageMapText(canvas.label) || "Untitled";
  const summary = getLanguageMapHtml(canvas.summary);

  useEffect(() => {
    const element = summaryRef.current;
    if (!element) {
      setCanExpand(false);
      return;
    }

    setCanExpand(element.scrollHeight > element.clientHeight + 1);
  }, [summary, expanded]);

  const openSummaryTab = () => {
    edit({ id: canvas.id, type: "Canvas" }, undefined, {
      selectedTab: "@exhibition/summary-editor",
      forceOpen: true,
    });
  };

  return (
    <InputContainer $wide>
      <div className="rounded-md border border-[#dcd5ce] bg-[#f8f6f3] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase text-[#6a625c]">Label</div>
            <div className="mt-1 break-words text-base font-semibold text-[#25211f]">{label}</div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 rounded-md px-3 py-2 text-sm font-semibold shadow-sm"
            style={{
              backgroundColor: "#b84c74",
              border: "1px solid #a13e63",
              color: "#ffffff",
            }}
            onClick={openSummaryTab}
          >
            Edit
          </button>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold uppercase text-[#6a625c]">Summary</div>
          <div
            ref={summaryRef}
            className={[
              "mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#332f2c]",
              expanded ? "" : "max-h-32 overflow-hidden",
            ].join(" ")}
          >
            {summary ? (
              <div
                className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            ) : (
              <span className="text-[#6a625c]">No summary added.</span>
            )}
          </div>
          {canExpand || expanded ? (
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-[#b84c74]"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          ) : null}
        </div>
      </div>
    </InputContainer>
  );
}

function TourStepsSummary({ canvas }: { canvas: any }) {
  const vault = useVault();
  const annotationPageRef = canvas.annotations?.[0];
  const annotationPage = annotationPageRef
    ? (vault.get(annotationPageRef, { skipSelfReturn: false } as any) as any)
    : null;
  const count = Array.isArray(annotationPage?.items) ? annotationPage.items.length : 0;
  const message =
    count === 0 ? "There are no tour steps yet." : `${count} tour step${count === 1 ? "" : "s"} on this canvas.`;

  return (
    <InputContainer $wide>
      <div className="rounded-md border border-[#dcd5ce] bg-white p-4">
        <div className="text-sm font-semibold text-[#25211f]">Tour steps</div>
        <div className="mt-1 text-sm text-[#6a625c]">{message}</div>
        <EditorTabLink
          canvas={canvas}
          tabId="@exhibition/tour-steps"
          label={count === 0 ? "Open Tour steps tab to add one" : "Open Tour steps tab"}
        />
      </div>
    </InputContainer>
  );
}

function EditorTabLink({ canvas, tabId, label }: { canvas: any; tabId: string; label: string }) {
  const { edit } = useLayoutActions();

  return (
    <button
      type="button"
      onClick={() => edit({ id: canvas.id, type: "Canvas" }, undefined, { selectedTab: tabId, forceOpen: true })}
      className="flex gap-2 items-center justify-between mt-3 text-me-primary-600 bg-gray-50 py-2 px-4 rounded-full hover:bg-gray-100"
    >
      <span className="text-left text-sm font-semibold">{label}</span>
      <ArrowRightIcon />
    </button>
  );
}

function getLanguageMapText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");

  if (typeof value === "object") {
    const values = Object.values(value).flatMap((item) => (Array.isArray(item) ? item : [item]));

    return values.filter((item): item is string => typeof item === "string").join(" ");
  }

  return "";
}
