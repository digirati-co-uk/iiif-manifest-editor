import type { EditorDefinition } from "@manifest-editor/shell";
import { annotationBodyType } from "../Model3DEditor";
import { SceneComponentEditor } from "./SceneComponentEditor";

const cameraTypes = ["PerspectiveCamera", "OrthographicCamera"];
const lightTypes = ["AmbientLight", "DirectionalLight", "ImageBasedLight", "PointLight", "SpotLight"];

function definition(id: string, label: string, types: string[]): EditorDefinition {
  return {
    id,
    label,
    supports: {
      edit: true,
      sortKey: "annotation-target",
      properties: ["body", "target"],
      resourceTypes: ["Annotation"],
      readOnlyProperties: [],
      custom: (resource, vault) => types.includes(annotationBodyType(resource, vault) || ""),
    },
    component: () => <SceneComponentEditor />,
  };
}

export const cameraEditor = definition("@manifest-editor/camera-editor", "Camera", cameraTypes);
export const lightEditor = definition("@manifest-editor/light-editor", "Light", lightTypes);
