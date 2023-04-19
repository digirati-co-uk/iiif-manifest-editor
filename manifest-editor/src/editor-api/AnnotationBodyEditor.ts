import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { BaseReferenceListEditor } from "@/editor-api/BaseReferenceListEditor";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { EditorConfig } from "@/editor-api/types";
import invariant from "tiny-invariant";

export class AnnotationBodyEditor extends BaseReferenceListEditor<
  AnnotationNormalized,
  Reference<"ContentResource"> | SpecificResource
> {
  constructor(config: EditorConfig) {
    super(config, "body");
  }

  getFirst() {
    const all = this.get();
    invariant(all[0], "Body not found");
    return all[0];
  }
}
