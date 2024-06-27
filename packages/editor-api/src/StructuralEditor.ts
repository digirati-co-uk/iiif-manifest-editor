import { Reference, StructuralProperties } from "@iiif/presentation-3";
import { BaseEditor } from "./BaseEditor";
import { EditorConfig } from "./types";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";

export class StructuralEditor<T extends Partial<StructuralProperties<any>>> extends BaseEditor<T> {
  items: BaseReferenceListEditor<T, Reference>;
  annotations: BaseReferenceListEditor<T, Reference<"AnnotationPage">>;
  structures: BaseReferenceListEditor<T, Reference<"Range">>;

  constructor(config: EditorConfig) {
    super(config);

    // @todo these could use custom editors.
    this.items = new BaseReferenceListEditor(config, "items");
    this.annotations = new BaseReferenceListEditor(config, "annotations");
    this.structures = new BaseReferenceListEditor(config, "structures");
  }
}
