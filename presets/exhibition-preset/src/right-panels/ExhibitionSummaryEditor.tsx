import type { InternationalString } from "@iiif/presentation-3";
import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { LanguageMapEditor, TiptapLanguageFieldEditor, type MetadataSave } from "@manifest-editor/editors";
import { type EditorDefinition, ResourceEditingProvider } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import { normalizeSummaryForHtmlEditor, normalizeSummaryForSave } from "./summary-html";

export const exhibitionSummaryEdtior: EditorDefinition = {
  id: "@exhibition/summary-editor",
  supports: {
    edit: true,
    properties: ["summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      // Hide the standalone Summary tab for textual-content (info box) canvases.
      return !isInfoBoxCanvas(resource as any, vault);
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
      <ExhibitionHtmlSummaryEditor canvas={canvas} />
    </ResourceEditingProvider>
  );
}

function ExhibitionHtmlSummaryEditor({ canvas }: { canvas: { id: string; summary?: InternationalString | null } }) {
  const vault = useVault();
  const fields = useMemo(() => normalizeSummaryForHtmlEditor(canvas.summary), [canvas.summary]);

  const saveSummary: MetadataSave = (data) => {
    vault.modifyEntityField(canvas as any, "summary", normalizeSummaryForSave(data.toInternationalString()));
  };

  return (
    <TiptapLanguageFieldEditor
      key={canvas.id}
      label="summary"
      metadataKey="summary"
      fields={fields}
      onSave={saveSummary}
    />
  );
}
