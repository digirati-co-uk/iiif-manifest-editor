import { getValue } from "@iiif/helpers";
import { isSpecificResource } from "@iiif/parser/presentation-4";
import { resolveFirstAnnotationBody } from "./scene-annotation-body";

const friendlyTypes: Record<string, string> = {
  Model: "3D model",
  PerspectiveCamera: "Perspective camera",
  OrthographicCamera: "Orthographic camera",
  AmbientLight: "Ambient light",
  DirectionalLight: "Directional light",
  ImageBasedLight: "Environment light",
  PointLight: "Point light",
  SpotLight: "Spot light",
  AmbientAudio: "Ambient audio",
  PointAudio: "Point audio",
  SpotAudio: "Spot audio",
};

export type SceneItemGroup = "Objects" | "Cameras" | "Lights" | "Audio" | "Other";

export function sceneItemGroup(type: string): SceneItemGroup {
  if (type === "Model" || type === "Scene" || type === "Canvas") return "Objects";
  if (type.endsWith("Camera")) return "Cameras";
  if (type.endsWith("Light")) return "Lights";
  if (type.endsWith("Audio") || type === "Sound" || type === "Audio") return "Audio";
  return "Other";
}

export function isActivatingAnnotation(annotation: any) {
  const motivations = Array.isArray(annotation?.motivation) ? annotation.motivation : [annotation?.motivation];
  return motivations.includes("activating");
}

export function describeSceneAnnotation(annotation: any, vault: any, index = 0) {
  const body: any = resolveFirstAnnotationBody(annotation, vault);
  const source = isSpecificResource(body) ? body.source : body;
  const resource: any = source ? vault.get(source, { skipSelfReturn: false }) || source : undefined;
  const type = String(resource?.type || body?.type || "ContentResource");
  const typeLabel = friendlyTypes[type] || type.replace(/([A-Z])/g, " $1").trim();
  const annotationLabel = getValue(annotation?.label);
  const resourceLabel = getValue(resource?.label);
  const textualBodyLabel = type === "TextualBody" ? plainText(resource?.value) : "";
  const urlName = type === "Model" ? filenameLabel(resource?.id) : "";
  return {
    annotation,
    body,
    resource,
    transforms: (isSpecificResource(body) ? (body as any).transform : resource?.transform) || [],
    type,
    typeLabel,
    group: sceneItemGroup(type),
    label: resourceLabel || annotationLabel || textualBodyLabel || urlName || `${typeLabel} ${index + 1}`,
  };
}

function plainText(value?: string) {
  return (
    value
      ?.replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}

function filenameLabel(value?: string) {
  if (!value) return "";
  try {
    const filename = new URL(value).pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(filename).replace(/\.(glb|gltf)$/i, "");
  } catch {
    return "";
  }
}
