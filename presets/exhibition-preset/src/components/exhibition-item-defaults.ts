import { getValue } from "@iiif/helpers";

export function needsExhibitionSummary(
  summary: Parameters<typeof getValue>[0],
) {
  return !getValue(summary);
}

export function withExhibitionDefaults(
  behavior: string[],
  width: number,
  height: number,
) {
  const defaultHeight =
    width > 0 && height > 0
      ? Math.max(1, Math.min(12, Math.round((width / height) * 12)))
      : 4;

  return [
    ...behavior.filter(
      (item) => !item.startsWith("w-") && !item.startsWith("h-"),
    ),
    "w-12",
    `h-${defaultHeight}`,
  ];
}
