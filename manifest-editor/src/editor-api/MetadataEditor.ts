import { DescriptiveProperties, InternationalString } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";
import { entityActions } from "@iiif/vault/actions";

export class MetadataEditor<T> extends BasePropertyEditor<T, DescriptiveProperties["metadata"]> {
  constructor(config: EditorConfig) {
    super(config, "metadata");
  }

  add(label: InternationalString, value: InternationalString, beforeIndex?: number) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.addMetadata({
        id: ref.id,
        label,
        value,
        type: ref.type as any,
        beforeIndex,
      })
    );
  }

  update(atIndex: number, label: InternationalString, value: InternationalString) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.updateMetadata({
        id: ref.id,
        label,
        value,
        type: ref.type as any,
        atIndex,
      })
    );
  }

  remove(atIndex: number) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.removeMetadata({
        id: ref.id,
        type: ref.type as any,
        atIndex,
      })
    );
  }

  reorder(startIndex: number, endIndex: number) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.reorderMetadata({
        id: ref.id,
        type: ref.type as any,
        startIndex,
        endIndex,
      })
    );
  }
}
