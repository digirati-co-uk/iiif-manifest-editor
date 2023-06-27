import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { BaseReferenceListEditor } from "@/editor-api/BaseReferenceListEditor";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { EditorConfig } from "@/editor-api/types";
import invariant from "tiny-invariant";
import { toRef } from "@iiif/parser";

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
