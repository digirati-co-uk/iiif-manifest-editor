import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { ResourceMetadataContent, ResourceMetadataTab } from "@manifest-editor/editors";
import type { EditorDefinition } from "@manifest-editor/shell";

export const exhibitionMetadataEditor: EditorDefinition = {
  id: "@exhibition/metadata-editor",
  label: "Metadata",
  labelMessage: { namespace: "editors", key: "fields.metadata" },
  supports: { edit: true, properties: ["metadata"], resourceTypes: ["Manifest", "Canvas"] },
  component: () => <ExhibitionMetadataPanel />,
};

export const STANDARD_METADATA_EDITOR_ID = "@manifest-editor/metadata";
export const ExhibitionMetadataTab = ResourceMetadataTab;

export function ExhibitionMetadataPanel() {
  return (
    <Sidebar>
      <SidebarContent>
        <ResourceMetadataContent />
      </SidebarContent>
    </Sidebar>
  );
}
