import { toRef } from "@iiif/parser";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import invariant from "tiny-invariant";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";
import type { EditorConfig } from "./types";

export class AnnotationBodyEditor extends BaseReferenceListEditor<
  AnnotationNormalized,
  Reference<"ContentResource"> | SpecificResource
> {
  constructor(config: EditorConfig) {
    super(config, "body");
  }

  isSpatial() {
    if (!this.hasBody()) {
      return false;
    }
    try {
      const bodyRef = this.getFirst();
      const body = this.config.vault.get(bodyRef);
      const ref = toRef(body);
      return ref?.type === "Video" || ref?.type === "Image";
    } catch (err) {
      return false;
    }
  }

  getIIIFSelectorHeightWidth() {
    try {
      const bodyRef = this.getFirst();
      const selector = (bodyRef as any).selector;
      if (!selector) {
        return null;
      }

      if (
        selector["@context"] !==
        "http://iiif.io/api/annex/openannotation/context.json"
      ) {
        return null;
      }

      const [x, y, width, height] = selector.region.split(",").map(Number);
      return { height, width };
    } catch (err) {
      return null;
    }
  }

  hasIIIFSelector() {
    const bodyRef = this.getFirst();
    const selector = (bodyRef as any).selector;
    if (!selector) {
      return false;
    }

    if (
      selector["@context"] !==
      "http://iiif.io/api/annex/openannotation/context.json"
    ) {
      return false;
    }

    return true;
  }

  updateIIIFSelector(box: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    const bodyRef = this.getFirst();
    const body = toRef(bodyRef);

    if (!body) {
      return;
    }

    const selector = (bodyRef as any).selector;
    if (!selector) {
      return;
    }

    if (
      selector["@context"] !==
      "http://iiif.io/api/annex/openannotation/context.json"
    ) {
      return;
    }

    const newSelector = {
      ...selector,
      region: `${~~box.x},${~~box.y},${~~box.width},${~~box.height}`,
    };

    this.config.vault.modifyEntityField(body, "selector", newSelector);
  }

  hasBody() {
    const all = this.get();
    return !!all[0];
  }

  getFirst() {
    const all = this.get();
    invariant(all[0], "Body not found");
    return all[0];
  }

  getFirstOrNone() {
    const all = this.get();

    if (!all) {
      return undefined;
    }

    return all[0] || undefined;
  }
}
