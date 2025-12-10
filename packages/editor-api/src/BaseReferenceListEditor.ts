import { createRangeHelper } from "@iiif/helpers";
import { entityActions } from "@iiif/helpers/vault/actions";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import type { EditorConfig } from "./types";
import { flattenRanges, randomId } from "./utils";

export class BaseReferenceListEditor<Entity, T> extends BasePropertyEditor<
  Entity,
  T[]
> {
  protected cachedList: T[] | undefined;
  protected cachedSortableList:
    | Array<Reference | ({ id: string } & SpecificResource)>
    | undefined;
  protected idCache = new Map();
  constructor(config: EditorConfig, property: string) {
    super(config, property);
  }

  focusId() {
    return `${super.focusId()}_${this.property}_list`;
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

  get(): T[] {
    this.config.tracker.track(this.property);
    const entity: any = this.entity();
    return (entity && entity[this.property]) as any;
  }

  set() {
    throw new Error("Cannot set directly");
  }

  empty() {
    this.config.vault.modifyEntityField(this.ref() as any, this.property, []);
  }

  moveToStart(index: number) {
    if (index <= 0) {
      return false;
    }
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: 0,
        key: this.property,
      }),
    );
    return true;
  }

  moveToEnd(index: number) {
    const list = this.getWithoutTracking();
    if (index >= list.length || index < 0) {
      return false;
    }
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: list.length,
        key: this.property,
      }),
    );
    return true;
  }

  deleteAtIndex(index: number) {
    const list = this.getWithoutTracking();

    if (index < 0 || index >= list.length) {
      return false;
    }

    const toRemove = list[index];
    if (toRemove) {
      this.config.vault.batch((vault) => {
        // Edge-case, if this is a Manifest, we need to ALSO check the ranges.
        if (this.getType() === "Manifest" && this.property === "items") {
          const fullManifest = vault.get(this.ref());
          const toRemoveId = vault.get(toRemove)?.id;
          if (
            toRemoveId &&
            fullManifest &&
            (fullManifest.structures || []).length > 0
          ) {
            // Grab all ranges.
            const allRanges = createRangeHelper(
              vault,
            ).rangesToTableOfContentsTree(fullManifest.structures);
            if (allRanges) {
              const flattened = flattenRanges(allRanges);
              for (const item of flattened) {
                if (item.items) {
                  const idx = item.items.findIndex(
                    (i) => i.type === "Canvas" && i.id === toRemoveId,
                  );
                  if (idx !== -1) {
                    vault.dispatch(
                      entityActions.removeReference({
                        id: item.id,
                        type: "Range",
                        key: "items",
                        reference: item.items[idx]!.resource,
                        index: idx,
                      }),
                    );
                  }
                }
              }
            }
          }
        }

        vault.dispatch(
          entityActions.removeReference({
            id: this.getId(),
            type: this.getType() as any,
            key: this.property,
            reference: toRemove,
            index: index,
          }),
        );
      });
      return true;
    }
    return false;
  }

  addAfter(index: number, reference: Reference | SpecificResource) {
    if (!reference) {
      return false;
    }
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
        index: index + 1,
      }),
    );
    return true;
  }

  addBefore(index: number, reference: Reference | SpecificResource) {
    if (!reference) {
      return false;
    }
    if (index < 0) {
      return false;
    }
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
        index: index,
      }),
    );
    return true;
  }

  add(reference: Reference | SpecificResource) {
    if (!reference) {
      return false;
    }
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
      }),
    );
    return true;
  }

  reorder(startIndex: number, endIndex: number) {
    if (startIndex === -1 || endIndex === -1) {
      return false;
    }
    if (startIndex === endIndex) {
      return false;
    }

    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex,
        endIndex,
        key: this.property,
      }),
    );
    return true;
  }

  moveUpBy(index: number, steps: number) {
    if (index === -1 || steps === 0) {
      return false;
    }

    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: Math.max(0, index - steps),
        key: this.property,
      }),
    );
    return true;
  }

  moveDownBy(index: number, steps: number) {
    if (index === -1 || steps === 0) {
      return false;
    }

    const list = this.getWithoutTracking();
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        // Maybe not +1
        endIndex: Math.min(list.length + 1, index + steps),
        key: this.property,
      }),
    );
    return true;
  }

  private duplicate(index: number) {
    // @todo Only duplicates the reference.
    if (true as boolean) {
      throw new Error("Not implemented");
    }

    const list = this.getWithoutTracking();
    const item = list[index];
    if (item) {
      this.config.vault.dispatch(
        entityActions.addReference({
          id: this.getId(),
          type: this.getType() as any,
          reference: { ...item },
          index: index + 1,
          key: this.property,
        }),
      );
    }
  }

  updateReference(index: number, item: Reference | SpecificResource) {
    if (!item) {
      return;
    }
    this.config.vault.dispatch(
      entityActions.updateReference({
        id: this.getId(),
        type: this.getType() as any,
        reference: item,
        index: index,
        key: this.property,
      }),
    );
  }

  private batchInsertAtIndex(indexes: number[], atOldIndex: number) {
    let oldIndex = atOldIndex;
    while (oldIndex !== -1 && indexes.indexOf(oldIndex) !== -1) {
      oldIndex--;
    }

    const list = this.getWithoutTracking();
    const beforeElement = oldIndex === -1 ? undefined : list[oldIndex];

    throw new Error("Not yet implemented");

    // @todo this needs more thought.
    // 0. If atOldIndex is in indexes - count down until it's not
    // 1. find the resource that should act as the "before" (CAN'T DO THIS IN BATCH)
    // 2. remove all references
    // 3. re-add them at index (incrementing by one)
  }
}
