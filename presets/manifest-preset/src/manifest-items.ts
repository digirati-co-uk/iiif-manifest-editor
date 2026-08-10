import { useEditingResource, useEditingResourceStack } from "@manifest-editor/shell";

export const manifestItemTypes = ["Canvas", "Timeline", "Scene"] as const;
export type ManifestItemType = (typeof manifestItemTypes)[number];

export function isManifestItem(item: any): item is { id: string; type: ManifestItemType } {
  return !!item?.id && manifestItemTypes.includes(item.type);
}

export function useManifestItemInStack() {
  const current = useEditingResource();
  const stack = useEditingResourceStack();

  if (isManifestItem(current?.resource?.source)) {
    return current;
  }

  return stack.find((item) => isManifestItem(item.resource?.source));
}
