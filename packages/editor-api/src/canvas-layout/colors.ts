/** Canvas colours are stored as hex values by the editor's colour field. */
export function canvasBackground(value: unknown): string {
  if (typeof value !== "string" || !/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(value.trim())) return "#ffffff";
  const hex = value.trim().slice(1);
  return `#${hex.length === 3 ? [...hex].map((part) => part + part).join("") : hex}`.toLowerCase();
}
/** Separate the canvas from the workspace, including when the chosen colour is nearly black. */
export function canvasWorkspaceBackground(value: unknown): string {
  const hex = canvasBackground(value).slice(1);
  const rgb = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const brightness = (rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722) / 255;
  const dark = brightness < 0.18;
  return `#${rgb
    .map((channel) =>
      Math.round(dark ? channel + (255 - channel) * 0.16 : channel * 0.86)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}
