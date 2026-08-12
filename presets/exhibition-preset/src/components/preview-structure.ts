import { getPaintingAnnotations } from "../slideshow-content-positioning";

export function getPreviewStructureKey(
  rootResource: { id: string; type: string },
  items: Array<{ id: string; type?: string }> | undefined,
) {
  return JSON.stringify([
    rootResource.id,
    rootResource.type,
    ...(items || []).map((item) => [item.id, item.type]),
  ]);
}

export function getPreviewImageTransformKey(
  vault: any,
  items: Array<{ id: string; type?: string }> | undefined,
) {
  const transforms = [];

  for (const canvasRef of items || []) {
    const canvas = vault.get(canvasRef, { skipSelfReturn: false } as any);

    for (const annotation of getPaintingAnnotations(vault, canvas)) {
      const bodies = Array.isArray(annotation.body)
        ? annotation.body
        : annotation.body
          ? [annotation.body]
          : [];

      for (const bodyRef of bodies) {
        const body = bodyRef?.id
          ? vault.get(bodyRef, {
              preserveSpecificResources: true,
              skipSelfReturn: false,
            } as any) || bodyRef
          : bodyRef;
        const selectors = Array.isArray(body?.selector)
          ? body.selector
          : body?.selector
            ? [body.selector]
            : [];

        for (const selector of selectors) {
          if (
            selector?.type === "ImageApiSelector" ||
            selector?.type === "iiif:ImageApiSelector"
          ) {
            transforms.push([
              annotation.id,
              selector.region ?? null,
              selector.rotation ?? null,
            ]);
          }
        }
      }
    }
  }

  return JSON.stringify(transforms);
}
