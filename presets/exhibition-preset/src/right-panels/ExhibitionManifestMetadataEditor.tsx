import type { EditorDefinition } from "@manifest-editor/shell";
import { exhibitionMetadataEditor } from "../metadata/ExhibitionMetadataPanel";

/**
 * Canvas metadata lives at the bottom of each slide's "Text content" panel, so the
 * standalone metadata tab is only registered for the Manifest.
 */
export const exhibitionManifestMetadataEditor: EditorDefinition = {
  ...exhibitionMetadataEditor,
  supports: {
    ...exhibitionMetadataEditor.supports,
    resourceTypes: ["Manifest"],
  },
};
