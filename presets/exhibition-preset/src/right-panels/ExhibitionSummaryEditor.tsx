import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { LanguageMapEditor } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";

export const exhibitionSummaryEdtior: EditorDefinition = {
  id: "@exhibition/summary-editor",
  supports: {
    edit: true,
    properties: ["summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource, vault)) return false;
      // Hide the standalone Summary tab for textual-content (info box) canvases.
      return !isInfoBoxCanvas(resource, vault);
    },
  },
  label: "Summary",
  component: () => <ExhibitionSummaryPanel />,
};

export function ExhibitionSummaryPanel() {
  return (
    <Sidebar>
      <SidebarContent padding>
        <ExhibitionSummaryContent />
      </SidebarContent>
    </Sidebar>
  );
}

export function ExhibitionSummaryContent() {
  const canvas = useCanvas();
  if (!canvas) return null;

  return (
    <ResourceEditingProvider resource={canvas}>
      <LanguageMapEditor dispatchType="label" />
      <LanguageMapEditor dispatchType="summary" />
    </ResourceEditingProvider>
  );
}
