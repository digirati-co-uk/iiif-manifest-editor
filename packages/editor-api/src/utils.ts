import { RangeTableOfContentsNode } from "@iiif/helpers";

export function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export function flattenRanges(range: RangeTableOfContentsNode) {
  const items: RangeTableOfContentsNode[] = [];
  if (range.type === "Range" && range.items) {
    range.items.forEach((item) => {
      items.push(item);
      if (range.type === "Range" && item.items) {
        items.push(...flattenRanges(item));
      }
    });
  }
  return items;
}
