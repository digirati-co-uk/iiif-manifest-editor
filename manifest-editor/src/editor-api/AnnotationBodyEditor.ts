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
    const bodyRef = this.getFirst();
    const body = this.config.vault.get(bodyRef);
    const ref = toRef(body);
    return ref?.type === "Video" || ref?.type === "Image";
  }

  getFirst() {
    const all = this.get();
    invariant(all[0], "Body not found");
    return all[0];
  }
}