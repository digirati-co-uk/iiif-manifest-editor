import {
  DescriptiveProperties,
  InternationalString,
  MetadataItem,
  Reference,
  SpecificResource,
} from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";
import { entityActions } from "@iiif/helpers/vault/actions";
import { randomId } from "./utils";

export class MetadataEditor<T> extends BasePropertyEditor<T, MetadataItem[]> {
  protected cachedList: MetadataItem[] | undefined;
  protected cachedSortableList: Array<{ id: string } & MetadataItem> = [];
  protected idCache = new Map();
  constructor(config: EditorConfig) {
    super(config, "metadata");
  }

  protected _getId(resource: any) {
    if (this.idCache.has(resource)) {
      return this.idCache.get(resource);
    }
    const newId = randomId();
    this.idCache.set(resource, newId);
    return newId;
  }

  getSortable() {
    const fresh = this.get();
    if (this.cachedList !== fresh) {
      this.cachedSortableList = (fresh || []).map((item: any) => {
        if (item.id) {
          return item;
        }
        return { id: this._getId(item), ...item };
      });
    }

    return this.cachedSortableList;
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

  deleteAtIndex(atIndex: number) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.removeMetadata({
        id: ref.id,
        type: ref.type as any,
        atIndex,
      })
    );
  }

  moveToStart(index: number) {
    this.reorder(index, 0);
  }
  moveToEnd(index: number) {
    const len = this.getWithoutTracking().length;
    this.reorder(index, len);
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
