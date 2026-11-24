import { toRef } from "@iiif/parser";
import { parseRegionParameter } from "@iiif/parser/image-3";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import invariant from "tiny-invariant";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";
import type { EditorConfig } from "./types";

export function getImageApiSelectorSize(
  selector: { type?: string; region?: string; rotation?: string | number; "@context"?: string } | undefined,
  fullSize?: { width: number; height: number }
) {
  if (
    !selector ||
    (selector["@context"] !== "http://iiif.io/api/annex/openannotation/context.json" &&
      !["ImageApiSelector", "iiif:ImageApiSelector"].includes(selector.type ?? ""))
  ) {
    return null;
  }

  let size = fullSize;
  if (typeof selector.region === "string") {
    const region = parseRegionParameter(selector.region);
    if (region.square && fullSize) {
      const side = Math.min(fullSize.width, fullSize.height);
      size = { width: side, height: side };
    } else if (region.w && region.h) {
      if (region.percent) {
        if (!fullSize) return null;
        size = {
          width: Math.round((fullSize.width * region.w) / 100),
          height: Math.round((fullSize.height * region.h) / 100),
        };
      } else {
        size = { width: region.w, height: region.h };
      }
    }
  }
  if (!size || !Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0) {
    return null;
  }

  const rotation = Number(String(selector.rotation ?? 0).replace(/^!/, ""));
  return Math.abs(rotation % 180) === 90 ? { width: size.height, height: size.width } : size;
}

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
    return getImageApiSelectorSize((this.getFirstOrNone() as SpecificResource | undefined)?.selector as any);
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
