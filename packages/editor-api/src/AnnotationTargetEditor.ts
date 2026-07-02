import { type BoxStyle, parseCssToBoxStyleMap, parseSelector, type SupportedSelectors } from "@iiif/helpers";
import type { Selector, SpecificResource, Stylesheet } from "@iiif/presentation-3";
import type { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import type { InputShape } from "polygon-editor";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { boxStyleMapToCss, generateStyleClass, getStylesheetCss, mergeBoxStyle } from "./helpers/box-style";
import type { EditorConfig } from "./types";

export class AnnotationTargetEditor extends BasePropertyEditor<AnnotationNormalized, SpecificResource> {
  constructor(config: EditorConfig) {
    super(config, "target");
  }

  getSourceId() {
    const { source } = this.get() || {};
    return source?.id;
  }

  removeSelector() {
    const existing = this.getWithoutTracking();
    this.set({
      ...existing,
      selector: undefined,
    });
  }

  getParsedSelector(): SupportedSelectors | null {
    const resource = this.get();
    if (resource.selector) {
      return parseSelector(resource.selector)?.selector;
    }
    return null;
  }

  setSelector(selector: Selector | Selector[]) {
    const existing = this.getWithoutTracking();
    if (existing && existing.source) {
      this.set({
        ...existing,
        selector: Array.isArray(selector) ? selector : [selector],
      });
    }
  }

  setSvgSelector(shape: InputShape, canvas: { width: number; height: number }) {
    const existing = this.getWithoutTracking();
    if (existing && existing.source) {
      const el = shape.open ? "polyline" : "polygon";
      this.set({
        ...existing,
        selector: {
          type: "SvgSelector",
          value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}"><${el} points="${shape.points.map((p: any) => p.join(",")).join(" ")}" /></svg>`,
        },
      });
    }
  }

  setPosition(position: { x: number; y: number; width: number; height: number }) {
    const existing = this.getWithoutTracking();
    if (existing && existing.source) {
      this.set({
        ...existing,
        selector: {
          type: "FragmentSelector",
          value: `xywh=${[~~position.x, ~~position.y, ~~position.width, ~~position.height].join(",")}`,
        },
      });
    }
  }

  // ----------------------------------------------------------------------------
  // Styling (styleClass on the target + CssStylesheet on the annotation)
  // ----------------------------------------------------------------------------

  /** The `styleClass` currently applied to the target, if any. */
  getStyleClass(): string | undefined {
    return this.get()?.styleClass;
  }

  /** Set (or clear, with `undefined`) the `styleClass` on the target. */
  setStyleClass(styleClass: string | undefined) {
    const existing = this.getWithoutTracking();
    if (existing) {
      this.set({
        ...existing,
        styleClass,
      });
    }
  }

  /** The raw `CssStylesheet` on the parent annotation, if any. */
  private getStylesheet(): Stylesheet | undefined {
    const entity = this.entity() as AnnotationNormalized;
    return (entity?.stylesheet as Stylesheet | undefined) ?? undefined;
  }

  /** The raw CSS text of the annotation stylesheet. */
  private getStylesheetCss(): string {
    return getStylesheetCss(this.getStylesheet());
  }

  /** Replace the annotation stylesheet with the provided CSS text. */
  private setStylesheetCss(css: string) {
    const value = css.trim();
    this.config.vault.modifyEntityField(
      this.config.reference as any,
      "stylesheet",
      value ? ({ type: "CssStylesheet", value } as Stylesheet) : null,
    );
  }

  /**
   * Resolve the effective `BoxStyle` for the target by looking up its
   * `styleClass` in the annotation stylesheet.
   */
  getBoxStyle(): BoxStyle {
    const styleClass = this.getStyleClass();
    if (!styleClass) return {};
    const map = parseCssToBoxStyleMap(this.getStylesheetCss());
    return map[styleClass] || {};
  }

  /**
   * Merge the given box style changes into the target's style. This keeps the
   * target's `styleClass` and the annotation's `CssStylesheet` in sync,
   * creating a `styleClass` when needed and removing both when no styles
   * remain. Passing an empty value (`undefined`, `null` or `""`) for a property
   * removes it.
   */
  setBoxStyle(changes: Partial<BoxStyle>) {
    const existingClass = this.getStyleClass();
    const map = parseCssToBoxStyleMap(this.getStylesheetCss());
    const current = (existingClass && map[existingClass]) || {};
    const next = mergeBoxStyle(current, changes);
    const hasStyles = Object.keys(next).length > 0;

    if (!hasStyles) {
      if (existingClass) {
        delete map[existingClass];
        this.setStyleClass(undefined);
      }
      this.setStylesheetCss(boxStyleMapToCss(map));
      return;
    }

    let styleClass = existingClass;
    if (!styleClass) {
      styleClass = generateStyleClass(this.getId());
      this.setStyleClass(styleClass);
    }
    map[styleClass] = next;
    this.setStylesheetCss(boxStyleMapToCss(map));
  }

  /** Remove all styling (both the `styleClass` and the stylesheet rule). */
  clearBoxStyle() {
    const existingClass = this.getStyleClass();
    if (!existingClass) return;
    const map = parseCssToBoxStyleMap(this.getStylesheetCss());
    delete map[existingClass];
    this.setStyleClass(undefined);
    this.setStylesheetCss(boxStyleMapToCss(map));
  }

  // Convenience helpers for the supported box style properties.

  setBorder(border: string | undefined) {
    this.setBoxStyle({ border });
  }

  getBorder(): string | undefined {
    return this.getBoxStyle().border;
  }

  setBorderColor(borderColor: string | undefined) {
    this.setBoxStyle({ borderColor });
  }

  getBorderColor(): string | undefined {
    return this.getBoxStyle().borderColor;
  }

  setBackground(background: string | undefined) {
    this.setBoxStyle({ background });
  }

  setBackgroundColor(backgroundColor: string | undefined) {
    this.setBoxStyle({ backgroundColor });
  }

  setOutline(outline: string | undefined) {
    this.setBoxStyle({ outline });
  }

  setBoxShadow(boxShadow: string | undefined) {
    this.setBoxStyle({ boxShadow });
  }

  setOpacity(opacity: number | undefined) {
    this.setBoxStyle({ opacity });
  }
}
