import type { Reference, StructuralProperties } from "@iiif/presentation-3";
import type { RangeNormalized } from "@iiif/presentation-3-normalized";
import { BaseEditor } from "./BaseEditor";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";
import { RangeReferenceListEditor } from "./RangeReferenceListEditor";
import type { EditorConfig } from "./types";

export class StructuralEditor<
  T extends Partial<StructuralProperties<any>>,
> extends BaseEditor<T> {
  items: BaseReferenceListEditor<T, Reference>;
  annotations: BaseReferenceListEditor<T, Reference<"AnnotationPage">>;
  structures: BaseReferenceListEditor<T, Reference<"Range">>;
  ranges: RangeReferenceListEditor<T>;

  constructor(config: EditorConfig) {
    super(config);

    // @todo these could use custom editors.
    this.items = new BaseReferenceListEditor(config, "items");
    this.annotations = new BaseReferenceListEditor(config, "annotations");
    this.structures = new BaseReferenceListEditor(config, "structures");

    // Custom.
    this.ranges = new RangeReferenceListEditor(
      config,
      this.getType() === "Manifest" ? "structures" : "items",
    );
  }
}
