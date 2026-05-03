import {
  canvasStructuralProperties,
  descriptiveProperties,
  linkingProperties,
  manifestStructuralProperties,
  metadata,
  rangeStructuralProperties,
  technicalProperties,
} from "@manifest-editor/editors";
import { type EditorConfig, type EditorDefinition, useEditor } from "@manifest-editor/shell";

const descriptiveFields = ["label", "summary", "language", "navDate", "provider", "requiredStatement", "rights", "thumbnail"];
const technicalFields = ["id", "viewingDirection", "height", "width", "duration", "behavior", "format", "motivation", "profile", "timeMode"];
const linkingFields = ["seeAlso", "supplementary", "logo", "service", "homepage", "partOf", "rendering", "services", "start"];

function hasAllowedField(notAllowed: string[], fields: string[]) {
  return fields.some((field) => !notAllowed.includes(field));
}

export function UniversalViewerSingleTab({ config }: { config: EditorConfig }) {
  const { technical, notAllowed } = useEditor();
  const resourceType = technical.type;

  return (
    <>
      {hasAllowedField(notAllowed, descriptiveFields) ? descriptiveProperties.component(config) : null}
      {!notAllowed.includes("metadata") ? metadata.component(config) : null}

      {resourceType === "Manifest" && hasAllowedField(notAllowed, ["items", "structures"])
        ? manifestStructuralProperties.component(config)
        : null}
      {resourceType === "Canvas" && hasAllowedField(notAllowed, ["items", "annotations"])
        ? canvasStructuralProperties.component(config)
        : null}
      {resourceType === "Range" && hasAllowedField(notAllowed, ["items"])
        ? rangeStructuralProperties.component(config)
        : null}

      {hasAllowedField(notAllowed, technicalFields) ? technicalProperties.component(config) : null}
      {hasAllowedField(notAllowed, linkingFields) ? linkingProperties.component(config) : null}
    </>
  );
}

export const universalViewerSingleTabEditor: EditorDefinition = {
  id: "@manifest-editor/universal-viewer-overview",
  label: "Overview",
  supports: {
    edit: true,
    properties: [],
    resourceTypes: ["Manifest", "Canvas", "Range", "ContentResource"],
  },
  component: (config) => <UniversalViewerSingleTab config={config} />,
};
