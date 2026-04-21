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

  protected _metadataSignature(item: MetadataItem) {
    return JSON.stringify({
      label: item.label || null,
      value: item.value || null,
    });
  }

  getSortable() {
    const fresh = this.get();
    if (this.cachedList !== fresh) {
      const previousIdsBySignature = new Map<string, string[]>();

      for (const item of this.cachedSortableList) {
        const signature = this._metadataSignature(item);
        const ids = previousIdsBySignature.get(signature) || [];
        ids.push(item.id);
        previousIdsBySignature.set(signature, ids);
      }

      this.cachedSortableList = (fresh || []).map((item: any, index) => {
        if (item.id) {
          return item;
        }
        const cachedId = this.idCache.get(item);
        if (cachedId) {
          const signature = this._metadataSignature(item);
          const previousIds = previousIdsBySignature.get(signature);

          if (previousIds) {
            previousIdsBySignature.set(
              signature,
              previousIds.filter((id) => id !== cachedId),
            );
          }

          return { id: cachedId, ...item };
        }
        const signature = this._metadataSignature(item);
        const previousIds = previousIdsBySignature.get(signature);
        const previousId = previousIds?.shift();
        const fallbackId =
          !previousId && this.cachedList?.length === fresh?.length
            ? this.cachedSortableList[index]?.id
            : undefined;
        const id = previousId || fallbackId || this._getId(item);

        this.idCache.set(item, id);

        return { id, ...item };
      });
      this.cachedList = fresh;
    }

    return this.cachedSortableList;
  }

  add(
    label: InternationalString,
    value: InternationalString,
    beforeIndex?: number,
  ) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.addMetadata({
        id: ref.id,
        label,
        value,
        type: ref.type as any,
        beforeIndex,
      }),
    );
  }

  update(
    atIndex: number,
    label: InternationalString,
    value: InternationalString,
  ) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.updateMetadata({
        id: ref.id,
        label,
        value,
        type: ref.type as any,
        atIndex,
      }),
    );
  }

  deleteAtIndex(atIndex: number) {
    const ref = this.ref();
    this.config.vault.dispatch(
      entityActions.removeMetadata({
        id: ref.id,
        type: ref.type as any,
        atIndex,
      }),
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
      }),
    );
  }
}
