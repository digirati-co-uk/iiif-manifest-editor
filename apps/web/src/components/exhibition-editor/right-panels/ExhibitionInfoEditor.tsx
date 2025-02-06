import { EditorConfig, EditorDefinition, useEditingResource, useEditor } from "@manifest-editor/shell";
import { getGridStats } from "../helpers";

export const exhibitionInfoEditorPanel: EditorDefinition = {
  id: "@exhibition/info-editor-panel",
  supports: {
    edit: true,
    properties: ["label", "summary"],
    resourceTypes: ["Canvas"],
    custom: ({ resource }, vault) => {
      const full = vault.get(resource);
      const stats = getGridStats(full.behavior);

      if (full.type === "Canvas" && stats.isInfo) {
        return false;
      }
      return false;
    },
  },
  label: "Exhibition",
  component: (config) => <ExhibitionInfoPanelEditor config={config} />,
};

function ExhibitionInfoPanelEditor({ config }: { config: EditorConfig }) {
  const resource = useEditingResource();

  return (
    <div>
      Exhibition info editor
      <pre>{JSON.stringify(resource, null, 2)}</pre>
    </div>
  );
}
