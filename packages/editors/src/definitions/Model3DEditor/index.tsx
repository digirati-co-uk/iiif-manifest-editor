import { isSpecificResource } from "@iiif/parser";
import type { EditorDefinition } from "@manifest-editor/shell";
import { Model3DEditor } from "./Model3DEditor";

export function annotationBodyType(resource: any, vault: any) {
  const annotation = vault.get(resource.resource);
  const first = annotation?.body?.[0];
  if (!first) return undefined;
  const source = isSpecificResource(first) ? first.source : first;
  return vault.get(source, { skipSelfReturn: false })?.type || source.type;
}

export const model3DEditor: EditorDefinition = {
  id: "@manifest-editor/model-3d-editor",
  label: "3D model",
  supports: {
    edit: true,
    sortKey: "annotation-target",
    properties: ["body", "target"],
    resourceTypes: ["Annotation"],
    readOnlyProperties: [],
    custom: (resource, vault) => annotationBodyType(resource, vault) === "Model",
  },
  component: () => <Model3DEditor />,
};
