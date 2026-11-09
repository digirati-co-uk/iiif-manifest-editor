import type { Vault } from "@iiif/helpers/vault";
import type { Reference } from "@iiif/presentation-3";
import {
  EditorInstance,
  fitWithinBounds,
  getCanvasLayout,
  getImageSize,
  setCanvasLayout,
  validSize,
} from "@manifest-editor/editor-api";
import type { CreatorOptions } from "./types";

/** A placement hint fits a resource inside a box; an explicit selector remains an exact target. */
export function placeCreatedResources(vault: Vault, result: Reference | Reference[], options: CreatorOptions) {
  const placement = options.placeholderPosition;
  if (!placement) return;
  const refs = Array.isArray(result) ? result : [result];
  const annotations = refs.flatMap((ref) => {
    if (ref.type === "Annotation") return [vault.get(ref)];
    if (options.parent?.resource.type === "Annotation" && options.parent.property === "body")
      return [vault.get(options.parent.resource)];
    return [];
  });
  const placed: string[] = [];
  const columns = Math.ceil(Math.sqrt(annotations.length));
  const rows = Math.ceil(annotations.length / columns);
  vault.batch(() => {
    annotations.forEach((annotation, i) => {
      const body = annotation.body?.[0] && vault.get<any>(annotation.body[0]);
      const size = getImageSize(vault, annotation) || (body && validSize(body) ? body : placement.bounds);
      const bounds = {
        x: placement.bounds.x + ((i % columns) * placement.bounds.width) / columns,
        y: placement.bounds.y + (Math.floor(i / columns) * placement.bounds.height) / rows,
        width: placement.bounds.width / columns,
        height: placement.bounds.height / rows,
      };
      const editor = new EditorInstance({ vault, reference: { id: annotation.id, type: "Annotation" } });
      const position = fitWithinBounds(size, bounds);
      editor.annotation.target.set({
        type: "SpecificResource",
        source: { id: placement.canvasId, type: "Canvas" },
        selector: {
          type: "FragmentSelector",
          value: `xywh=${position.x},${position.y},${position.width},${position.height}`,
        },
      });
      placed.push(annotation.id);
    });
    const state = getCanvasLayout(vault, placement.canvasId);
    if (state && placement.placeholderId && placed.length)
      setCanvasLayout(vault, placement.canvasId, {
        ...state,
        slots: state.slots.map((slot) =>
          slot.id === placement.placeholderId ? { ...slot, annotationIds: placed } : slot
        ),
      });
  });
}
