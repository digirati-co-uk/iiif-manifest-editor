import { BasePropertyEditor } from "./BasePropertyEditor";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { SpecificResource } from "@iiif/presentation-3";
import { EditorConfig } from "./types";
import { SupportedSelectors, parseSelector } from "@iiif/helpers";
import { InputShape } from "polygon-editor";

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
}
