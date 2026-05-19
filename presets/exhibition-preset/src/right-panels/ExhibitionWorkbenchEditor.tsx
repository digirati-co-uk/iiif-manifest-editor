import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { LanguageMapEditor } from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useLocalStorage,
} from "@manifest-editor/shell";
import { useState } from "react";
import { Button } from "react-aria-components";
import { useCanvas } from "react-iiif-vault";
import { isEditableExhibitionCanvas } from "../helpers";
import { ExhibitionCanvasAdvancedContent } from "./ExhibitionCanvasEditor";
import { ExhibitionTourStepsContent } from "./ExhibitionTourSteps";
import { SlideBehavioursContent } from "./SlideBehaviours";

type EditingMode = "simple" | "advanced";
type RightPanelTab = "layout" | "summary" | "tour";

const tabs: Array<{ id: RightPanelTab; label: string }> = [
  { id: "layout", label: "Layout" },
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
const workbenchColours = {
  divider: "#e4ddd6",
};

export const exhibitionWorkbenchEditor: EditorDefinition = {
  id: "@exhibition/workbench-editor",
  supports: {
    edit: true,
    properties: ["label", "summary", "behavior", "annotations"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) =>
      isEditableExhibitionCanvas(resource, vault),
  },
  label: "Canvas",
  component: () => <ExhibitionWorkbenchRightPanel />,
};

function ExhibitionWorkbenchRightPanel() {
  const [mode, setMode] = useLocalStorage<EditingMode>(
    workbenchStorageKey,
    "simple",
  );
  const [selectedTab, setSelectedTab] = useState<RightPanelTab>("layout");

  return (
    <Sidebar>
      <SidebarContent className="bg-white px-6 pt-5 pb-20">
        <div className="flex justify-center">
          <SegmentedToggle
            value={mode}
            options={modeOptions}
            onChange={setMode}
          />
        </div>

        <div
          className="mt-5 grid grid-cols-3 border-b"
          style={{ borderColor: workbenchColours.divider }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={[
                "exhibition-workbench-tab",
                "-mb-px border-b-[3px] border-transparent px-1 pb-3 text-center text-sm font-semibold",
                selectedTab === tab.id
                  ? "border-me-primary-500 text-me-primary-500"
                  : "exhibition-workbench-muted",
              ].join(" ")}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8 px-4">
          {selectedTab === "layout" ? (
            <SlideBehavioursContent mode={mode} />
          ) : null}
          {selectedTab === "summary" ? (
            mode === "simple" ? (
              <SimpleSummaryPanel />
            ) : (
              <ExhibitionCanvasAdvancedContent />
            )
          ) : null}
          {selectedTab === "tour" ? (
            <ExhibitionTourStepsContent mode={mode} />
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
              color: selected
                ? toggleColours.activeText
                : toggleColours.inactiveText,
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
            <LanguageMapEditor
              dispatchType="label"
              disableMultiline
              disallowHTML
            />
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

function SimpleFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="exhibition-workbench-muted text-sm font-semibold">
      {children}
    </div>
  );
}
