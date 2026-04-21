import { FLAG_TAG, type BackgroundActionRunContext, type ManifestEditorTag } from "@manifest-editor/shell";

export type OcrDoclingTagOption = ManifestEditorTag & {
  key: string;
  canvasCount: number;
};

export function getCanvasTagOptions(ctx: BackgroundActionRunContext, canvases: any[]): OcrDoclingTagOption[] {
  const tags = new Map<string, OcrDoclingTagOption>();

  tags.set(getTagKey(FLAG_TAG), {
    ...FLAG_TAG,
    key: getTagKey(FLAG_TAG),
    canvasCount: 0,
  });

  for (const canvas of canvases) {
    if (!canvas?.id) {
      continue;
    }

    for (const tag of ctx.tags.getTags({ id: canvas.id, type: "Canvas" })) {
      const key = getTagKey(tag);
      const existing = tags.get(key);

      if (existing) {
        existing.canvasCount += 1;
      } else {
        tags.set(key, {
          ...tag,
          key,
          canvasCount: 1,
        });
      }
    }
  }

  return Array.from(tags.values()).sort((a, b) => {
    if (a.type === FLAG_TAG.type && a.id === FLAG_TAG.id) return -1;
    if (b.type === FLAG_TAG.type && b.id === FLAG_TAG.id) return 1;
    return a.label.localeCompare(b.label) || a.type.localeCompare(b.type) || a.id.localeCompare(b.id);
  });
}

export function getTagKey(tag: Pick<ManifestEditorTag, "type" | "id">) {
  return `${tag.type}:${tag.id}`;
}

export function parseTagKey(key: string): { type: string; id: string } | null {
  const separator = key.indexOf(":");
  if (separator === -1) {
    return null;
  }

  return {
    type: key.slice(0, separator),
    id: key.slice(separator + 1),
  };
}
