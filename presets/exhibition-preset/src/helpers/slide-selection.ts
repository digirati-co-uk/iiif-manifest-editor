export function getSlideSelectionAfterDeletion(
  items: Array<{ id: string }>,
  selectedId: string | undefined,
  deletedId: string,
) {
  if (selectedId !== deletedId) return selectedId;

  const deletedIndex = items.findIndex((item) => item.id === deletedId);
  if (deletedIndex === -1) return selectedId;

  return items[deletedIndex + 1]?.id || items[deletedIndex - 1]?.id;
}
