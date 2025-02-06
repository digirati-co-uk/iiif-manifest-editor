import { EditorDefinition, ResourceEditingProvider, useEditingResource } from "@manifest-editor/shell";
import { getClassName, getGridStats } from "../helpers";
import { LanguageMapEditor } from "@manifest-editor/editors";
import { useCanvas } from "react-iiif-vault";
import { Sidebar, SidebarContent } from "@manifest-editor/components";

export const exhibitionSummaryEdtior: EditorDefinition = {
  id: "@exhibition/summary-editor",
  supports: {
    edit: true,
    properties: ["summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      const full = vault.get(resource);
      const stats = getGridStats(full.behavior);

      if (full.type === "Canvas" && !stats.isInfo && !stats.isBottom) {
        return true;
      }
      return false;
    },
  },
  label: "Summary",
  component: () => <ExhibitionRightPanel />,
};

function ExhibitionRightPanel() {
  const canvas = useCanvas();
  if (!canvas) return null;

  return (
    <Sidebar>
      <SidebarContent padding>
        <ResourceEditingProvider resource={canvas}>
          <LanguageMapEditor dispatchType="summary" />
        </ResourceEditingProvider>
      </SidebarContent>
    </Sidebar>
  );
}
