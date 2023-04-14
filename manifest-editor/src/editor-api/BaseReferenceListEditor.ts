import { Reference, SpecificResource } from "@iiif/presentation-3";
import { BasePropertyEditor } from "./BasePropertyEditor";
import { EditorConfig } from "./types";
import { entityActions } from "@iiif/vault/actions";

export class BaseReferenceListEditor<Entity, T> extends BasePropertyEditor<Entity, T[]> {
  constructor(config: EditorConfig, property: string) {
    super(config, property);
  }

  focusId() {
    return `${super.focusId()}_${this.property}_list`;
  }

  get(): T[] {
    this.config.tracker.track(this.property);
    const entity: any = this.entity();
    return (entity && entity[this.property]) as any;
  }

  set() {
    throw new Error("Cannot set directly");
  }

  moveToStart(index: number) {
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: 0,
        key: this.property,
      })
    );
  }

  moveToEnd(index: number) {
    const list = this.getWithoutTracking();
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: list.length,
        key: this.property,
      })
    );
  }

  deleteAtIndex(index: number) {
    const list = this.getWithoutTracking();
    const toRemove = list[index];
    if (toRemove) {
      this.config.vault.dispatch(
        entityActions.removeReference({
          id: this.getId(),
          type: this.getType() as any,
          key: this.property,
          reference: toRemove,
          index: index,
        })
      );
    }
  }

  addAfter(index: number, reference: Reference | SpecificResource) {
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
        index: index,
      })
    );
  }

  addBefore(index: number, reference: Reference | SpecificResource) {
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
        index: index - 1,
      })
    );
  }

  add(reference: Reference | SpecificResource) {
    this.config.vault.dispatch(
      entityActions.addReference({
        id: this.getId(),
        type: this.getType() as any,
        key: this.property,
        reference,
      })
    );
  }

  reorder(startIndex: number, endIndex: number) {
    console.log("reoder", {
      id: this.getId(),
      type: this.getType() as any,
      startIndex,
      endIndex,
      key: this.property,
    });
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex,
        endIndex,
        key: this.property,
      })
    );
  }

  moveUpBy(index: number, steps: number) {
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        endIndex: Math.max(0, index - steps),
        key: this.property,
      })
    );
  }

  moveDownBy(index: number, steps: number) {
    const list = this.getWithoutTracking();
    this.config.vault.dispatch(
      entityActions.reorderEntityField({
        id: this.getId(),
        type: this.getType() as any,
        startIndex: index,
        // Maybe not +1
        endIndex: Math.min(list.length + 1, index + steps),
        key: this.property,
      })
    );
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
        })
      );
    }
  }

  updateReference(index: number, item: Reference | SpecificResource) {
    this.config.vault.dispatch(
      entityActions.updateReference({
        id: this.getId(),
        type: this.getType() as any,
        reference: item,
        index: index,
        key: this.property,
      })
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
