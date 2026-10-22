import { loadResource, type LoadedResource } from "../../support/load-resource";

export type EditorTarget =
  | "manifest"
  | "canvas"
  | "paintingAnnotation"
  | "paintingBody"
  | "annotationPage"
  | "annotation"
  | "range"
  | "nestedRange"
  | "partOf";

type Reference = { id: string; type: string };
type StoryEntity = Reference & {
  items?: Reference[];
  annotations?: Reference[];
  structures?: Reference[];
  body?: Reference[];
  label?: Record<string, string[]>;
};

export interface EditorSelection {
  reference: Reference;
  context?: { parent: Reference; property: string; index: number };
  canvasId?: string;
  jsonReference?: Reference;
}

const parentCollection = "https://iiif.io/api/cookbook/recipe/0030-multi-volume/collection.json";

export async function selectEditorTarget(loaded: LoadedResource, target: EditorTarget): Promise<EditorSelection> {
  const { vault, resource } = loaded;
  const entity = (ref: Reference) => vault.get(ref) as StoryEntity;
  const root = entity(resource);
  const selection = (reference: Reference | undefined, parent: Reference, property: string, canvasId?: string) => {
    if (!reference?.id) throw new Error(`The source has no ${target} resource to edit.`);
    return { reference, context: { parent, property, index: 0 }, canvasId };
  };

  if (target === "manifest") return { reference: resource };
  if (target === "range" || target === "nestedRange") {
    const range = selection(root.structures?.[0], resource, "structures");
    return target === "range" ? range : selection(entity(range.reference).items?.[0], range.reference, "items");
  }
  if (target === "partOf") {
    // The Cookbook volume omits its inverse collection link. Add only that real reference in this story's Vault.
    // Keep the collection in a separate Vault so its brief Manifest references cannot overwrite the loaded volume.
    const { data: collection } = await loadResource(parentCollection);
    const reference = { id: collection.id, type: collection.type, label: collection.label };
    await vault.load(reference.id, { ...reference, items: [] });
    vault.modifyEntityField(resource, "partOf", [reference]);
    return { ...selection(reference, resource, "partOf"), jsonReference: resource };
  }
  if (root.type !== "Manifest") throw new Error("This editor target needs a Manifest source.");
  const canvas = selection(root.items?.[0], resource, "items");
  const canvasId = canvas.reference.id;
  if (target === "canvas") return { ...canvas, canvasId };
  const canvasEntity = entity(canvas.reference);
  const isSupplementary = target === "annotationPage" || target === "annotation";
  const page = selection(
    (isSupplementary ? canvasEntity.annotations : canvasEntity.items)?.[0],
    canvas.reference,
    isSupplementary ? "annotations" : "items",
    canvasId
  );
  if (target === "annotationPage") return page;
  const annotation = selection(entity(page.reference).items?.[0], page.reference, "items", canvasId);
  if (target === "paintingBody")
    return selection(entity(annotation.reference).body?.[0], annotation.reference, "body", canvasId);
  return annotation;
}
