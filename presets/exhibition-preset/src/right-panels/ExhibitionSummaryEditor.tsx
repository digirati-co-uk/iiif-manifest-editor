import type { InternationalString } from "@iiif/presentation-3";
import { Sidebar, SidebarContent } from "@manifest-editor/components";
import {
  LanguageMapEditor,
  LanguageFieldEditor,
  InputContainer,
  InputFieldset,
  InputLabel,
  TiptapLanguageFieldEditor,
  type MetadataSave,
} from "@manifest-editor/editors";
import {
  type EditorDefinition,
  ResourceEditingProvider,
  useEditor,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { isEditableExhibitionCanvas, isInfoBoxCanvas } from "../helpers";
import {
  normalizeSummaryForHtmlEditor,
  normalizeSummaryForSave,
} from "./summary-html";

export const exhibitionSummaryEdtior: EditorDefinition = {
  id: "@exhibition/summary-editor",
  supports: {
    edit: true,
    properties: ["summary", "requiredStatement"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      if (!isEditableExhibitionCanvas(resource as any, vault)) return false;
      // Hide the standalone Text content tab for textual-content (info box) canvases.
      return !isInfoBoxCanvas(resource as any, vault);
    },
  },
  label: "Text content",
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
      <ExhibitionHtmlSummaryEditor resource={canvas} />
      <ExhibitionRequiredStatementEditor />
    </ResourceEditingProvider>
  );
}

export function ExhibitionRequiredStatementEditor() {
  const { descriptive } = useEditor();
  const { requiredStatement } = descriptive;
  const statement = requiredStatement.get();

  return (
    <InputContainer $wide id={requiredStatement.containerId()}>
      <InputLabel htmlFor={requiredStatement.focusId()}>Required statement</InputLabel>
      <InputFieldset id={requiredStatement.focusId()}>
        <LanguageFieldEditor
          focusId={`${requiredStatement.focusId()}_label`}
          label="Label"
          fields={statement?.label || { none: [] }}
          onSave={(e: any) => requiredStatement.updateLabel(e.toInternationalString())}
        />
        <LanguageFieldEditor
          focusId={`${requiredStatement.focusId()}_value`}
          label="Value"
          fields={statement?.value || { none: [] }}
          onSave={(e: any) => requiredStatement.update(e.toInternationalString())}
        />
      </InputFieldset>
    </InputContainer>
  );
}

export function ExhibitionHtmlSummaryEditor({
  resource,
}: {
  resource: { id: string; type?: string; summary?: InternationalString | null };
}) {
  const vault = useVault();
  const fields = useMemo(
    () => normalizeSummaryForHtmlEditor(resource.summary),
    [resource.summary],
  );

  const saveSummary: MetadataSave = (data) => {
    vault.modifyEntityField(
      resource as any,
      "summary",
      normalizeSummaryForSave(data.toInternationalString()),
    );
  };

  return (
    <TiptapLanguageFieldEditor
      key={resource.id}
      label="summary"
      metadataKey="summary"
      fields={fields}
      onSave={saveSummary}
    />
  );
}
