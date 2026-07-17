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
