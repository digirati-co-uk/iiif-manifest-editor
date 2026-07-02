import type { BoxStyle } from "@iiif/helpers";
import type { Stylesheet } from "@iiif/presentation-3";

/**
 * The set of box style properties we currently support editing. These map
 * directly onto the `BoxStyle` type from `@iiif/helpers` and are the only
 * properties that will be serialised into a `CssStylesheet`.
 */
export const SUPPORTED_BOX_STYLE_PROPERTIES = [
  "backgroundColor",
  "opacity",
  "boxShadow",
  "borderColor",
  "borderWidth",
  "borderStyle",
  "outlineColor",
  "outlineWidth",
  "outlineOffset",
  "outlineStyle",
  "border",
  "outline",
  "background",
  "transform",
  "transformOrigin",
] as const;

export type SupportedBoxStyleProperty = (typeof SUPPORTED_BOX_STYLE_PROPERTIES)[number];

/** Mapping of `BoxStyle` (camelCase) keys onto their CSS property names. */
const CSS_PROPERTY_NAMES: Record<SupportedBoxStyleProperty, string> = {
  backgroundColor: "background-color",
  opacity: "opacity",
  boxShadow: "box-shadow",
  borderColor: "border-color",
  borderWidth: "border-width",
  borderStyle: "border-style",
  outlineColor: "outline-color",
  outlineWidth: "outline-width",
  outlineOffset: "outline-offset",
  outlineStyle: "outline-style",
  border: "border",
  outline: "outline",
  background: "background",
  transform: "transform",
  transformOrigin: "transform-origin",
};

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/**
 * Serialise a single `BoxStyle` into a CSS declaration block (without the
 * surrounding braces), e.g. `border:3px solid #121212;`.
 */
export function boxStyleToCssDeclarations(style: BoxStyle): string {
  const declarations: string[] = [];
  for (const property of SUPPORTED_BOX_STYLE_PROPERTIES) {
    const value = (style as Record<string, unknown>)[property];
    if (isEmptyValue(value)) continue;
    declarations.push(`${CSS_PROPERTY_NAMES[property]}:${value};`);
  }
  return declarations.join("");
}

/**
 * Serialise a map of class-name -> `BoxStyle` into a CSS stylesheet string.
 * Classes with no (supported) declarations are omitted.
 */
export function boxStyleMapToCss(map: Record<string, BoxStyle>): string {
  const rules: string[] = [];
  for (const [className, style] of Object.entries(map)) {
    const declarations = boxStyleToCssDeclarations(style);
    if (!declarations) continue;
    rules.push(`.${className}{${declarations}}`);
  }
  return rules.join("\n");
}

/**
 * Extract the raw CSS string from an annotation `stylesheet` property. The
 * value may be a string, an array of strings, or absent.
 */
export function getStylesheetCss(stylesheet?: Stylesheet | string | null): string {
  if (!stylesheet) return "";
  if (typeof stylesheet === "string") return stylesheet;
  const value = (stylesheet as { value?: string | string[] }).value;
  if (!value) return "";
  return Array.isArray(value) ? value.join("\n") : value;
}

/**
 * Merge a partial `BoxStyle` into an existing one. Empty values (`undefined`,
 * `null` or `""`) remove the corresponding property.
 */
export function mergeBoxStyle(current: BoxStyle, changes: Partial<BoxStyle>): BoxStyle {
  const next: BoxStyle = { ...current };
  for (const [key, value] of Object.entries(changes)) {
    if (isEmptyValue(value)) {
      delete (next as Record<string, unknown>)[key];
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
  }
  return next;
}

/**
 * Generate a stable, CSS-safe class name for an annotation target based on its
 * id. The `me-style-` prefix guarantees the class name starts with a letter.
 */
export function generateStyleClass(id: string): string {
  const base = id.split(/[/#?]/).filter(Boolean).pop() || id;
  const slug = base
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);
  return `me-style-${slug || Math.random().toString(36).slice(2, 8)}`;
}
