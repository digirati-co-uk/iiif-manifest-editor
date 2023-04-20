import { BasePropertyEditor } from "@/editor-api/BasePropertyEditor";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { SpecificResource } from "@iiif/presentation-3";
import { EditorConfig } from "@/editor-api/types";
import { parseSelector } from "@iiif/vault-helpers";

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

  getParsedSelector() {
    const resource = this.get();
    if (resource.selector) {
      return parseSelector(resource.selector)?.selector;
    }
    return null;
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
