import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { LanguageMapEditor } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider, useLocalStorage } from "@manifest-editor/shell";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "react-aria-components";
import { useCanvas } from "react-iiif-vault";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";
import { ExhibitionSummaryContent } from "./ExhibitionSummaryEditor";
import { ExhibitionTourStepsContent } from "./ExhibitionTourSteps";
import { InfoBoxPanel } from "./InfoBoxPanel";
import { SlideBehavioursContent } from "./SlideBehaviours";
import { SlideshowContentPanel } from "./SlideshowContentPanel";

type EditingMode = "simple" | "advanced";
type WorkbenchPreset = "default" | "slideshow";
type RightPanelTab = "layout" | "content" | "summary" | "tour";

const defaultTabs: Array<{ id: RightPanelTab; label: string }> = [
  { id: "layout", label: "Layout" },
  { id: "summary", label: "Summary" },
  { id: "tour", label: "Tour steps" },
];

const slideshowTabs: Array<{ id: RightPanelTab; label: string }> = [
  { id: "layout", label: "Layout" },
  { id: "content", label: "Content" },
  { id: "summary", label: "Summary" },
  { id: "tour", label: "Tour steps" },
];

const modeOptions: Array<{ value: EditingMode; label: string }> = [
  { value: "simple", label: "Simple" },
  { value: "advanced", label: "Advanced" },
];

const workbenchStorageKey = "exhibition-right-panel-mode";
const toggleColours = {
  track: "#f5eaf0",
  active: "#b84c74",
  inactiveText: "#8b3f61",
  activeText: "#ffffff",
  activeShadow: "0 1px 3px rgba(15, 23, 42, 0.18)",
};

export const exhibitionWorkbenchEditor: EditorDefinition = {
  id: "@exhibition/workbench-editor",
  supports: {
    edit: true,
    properties: ["label", "summary", "behavior", "annotations"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource, vault)) return false;
      // In standalone-tab mode (non-slideshow presets) the workbench only shows
      // for info-box canvases; image canvases use the individual tabs instead.
      return isInfoBoxCanvas(resource, vault);
    },
  },
  label: "Canvas",
  component: () => <ExhibitionWorkbenchRightPanel />,
};

export const slideshowWorkbenchEditor: EditorDefinition = {
  ...exhibitionWorkbenchEditor,
  id: "@exhibition/slideshow-workbench-editor",
  supports: {
    ...exhibitionWorkbenchEditor.supports,
    // In slideshow mode (singleTab) the workbench handles ALL canvas types.
    custom: ({ resource }, vault) => isEditableExhibitionCanvas(resource, vault),
  },
  component: () => <ExhibitionWorkbenchRightPanel preset="slideshow" />,
};

function ExhibitionWorkbenchRightPanel({ preset = "default" }: { preset?: WorkbenchPreset }) {
  const [mode, setMode] = useLocalStorage<EditingMode>(workbenchStorageKey, "simple");
  const canvas = useCanvas();
  const isInfoBox = Boolean(canvas?.behavior?.includes("info"));

  const tabs = preset === "slideshow" ? slideshowTabs : defaultTabs;
  const [selectedTab, setSelectedTab] = useState<RightPanelTab>("layout");
  const requestedTab = useSlideshowWorkbenchState((state) => state.requestedTab);
  const clearRequestedTab = useSlideshowWorkbenchState((state) => state.clearRequestedTab);

  useEffect(() => {
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setSelectedTab(requestedTab as RightPanelTab);
      clearRequestedTab();
    }
  }, [clearRequestedTab, requestedTab, tabs]);

  // For info-box canvases inside the slideshow singleTab context, render the
  // dedicated InfoBoxPanel directly — no nested tabs, no double toggle.
  if (isInfoBox) {
    return <InfoBoxPanel />;
  }

  return (
    <Sidebar>
      <SidebarContent className="bg-white px-6 pt-5 pb-20">
        <div className="flex justify-center">
          <SegmentedToggle value={mode} options={modeOptions} onChange={setMode} />
        </div>

        <div
          className={["mt-5 grid border-b border-[#e4ddd6]", tabs.length === 4 ? "grid-cols-4" : "grid-cols-3"].join(
            " ",
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={[
                "exhibition-workbench-tab",
                "-mb-px border-b-[3px] border-transparent px-1 pb-3 text-center text-sm font-semibold",
                selectedTab === tab.id ? "border-me-primary-500 text-me-primary-500" : "exhibition-workbench-muted",
              ].join(" ")}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 px-4">
          {selectedTab === "layout" ? (
            <SlideBehavioursContent mode={mode} layoutContext={preset === "slideshow" ? "slideshow" : "default"} />
          ) : null}
          {selectedTab === "content" ? <SlideshowContentPanel /> : null}
          {selectedTab === "summary" ? mode === "simple" ? <SimpleSummaryPanel /> : <ExhibitionSummaryContent /> : null}
          {selectedTab === "tour" ? (
            <ExhibitionTourStepsContent mode={mode} useSlideshowWorkbench={preset === "slideshow"} />
          ) : null}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="grid w-full max-w-[240px] grid-cols-2 rounded-full p-1"
      style={{ backgroundColor: toggleColours.track }}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Button
            key={option.value}
            className="border-none rounded-full bg-transparent px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: selected ? toggleColours.active : "transparent",
              color: selected ? toggleColours.activeText : toggleColours.inactiveText,
              boxShadow: selected ? toggleColours.activeShadow : "none",
            }}
            onPress={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

function SimpleSummaryPanel() {
  const canvas = useCanvas();
  if (!canvas) return null;
  return (
    <ResourceEditingProvider resource={canvas}>
      <div className="flex flex-col gap-7">
        <div>
          <SimpleFieldLabel>Slide title</SimpleFieldLabel>
          <div className="mt-2">
            <LanguageMapEditor dispatchType="label" disableMultiline disallowHTML />
          </div>
        </div>
        <div>
          <SimpleFieldLabel>Slide summary</SimpleFieldLabel>
          <div className="mt-2">
            <LanguageMapEditor dispatchType="summary" />
          </div>
        </div>
      </div>
    </ResourceEditingProvider>
  );
}

function SimpleFieldLabel({ children }: { children: ReactNode }) {
  return <div className="exhibition-workbench-muted text-sm font-semibold">{children}</div>;
}
