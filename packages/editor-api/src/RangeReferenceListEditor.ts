import {
  createRangeHelper,
  type RangeTableOfContentsNode,
} from "@iiif/helpers";
import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import type { RangeNormalized } from "@iiif/presentation-3-normalized";
import type { EditorConfig } from ".";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";

export class RangeReferenceListEditor<Entity> extends BaseReferenceListEditor<
  Entity,
  RangeNormalized["items"][number]
> {
  helper: ReturnType<typeof createRangeHelper>;
  constructor(config: EditorConfig, property: string) {
    super(config, property);
    this.helper = createRangeHelper(config.vault);
  }

  mergeRanges(
    mergeRange: RangeTableOfContentsNode,
    toMergeRange: RangeTableOfContentsNode,
    empty?: boolean,
  ) {
    if (mergeRange.type !== "Range" || toMergeRange.type !== "Range") return;

    const vault = this.config.vault;
    const foundIndex = this.getWithoutTracking().findIndex(
      (item) => toRef(item)?.id === mergeRange.id,
    );

    if (foundIndex === -1) {
      console.error(`Range ${mergeRange.id} not found in ${toMergeRange.id}`);
      return;
    }

    const fullMergeRange = vault.get({ id: mergeRange.id, type: "Range" });

    vault.batch(() => {
      vault.dispatch(
        moveEntities({
          subjects: {
            type: "slice",
            startIndex: 0,
            length: fullMergeRange.items.length,
          },
          from: {
            id: fullMergeRange.id,
            type: "Range",
            key: "items",
          },
          to: {
            id: toMergeRange.id,
            type: "Range",
            key: "items",
          },
        }),
      );
      // Then remove the range.
      if (!empty) {
        this.deleteAtIndex(foundIndex);
      }
    });
  }

  async splitRange(
    topLevelRange: RangeTableOfContentsNode,
    range: RangeTableOfContentsNode,
    item: RangeTableOfContentsNode,
    createEmptyRange: (
      atIndex: number,
    ) =>
      | Promise<{ id: string; type: "Range" }>
      | { id: string; range: "Range" },
  ) {
    const vault = this.config.vault;
    if (!topLevelRange) return;

    // @todo Batch all of these actions as one.

    const index = (range.items || []).indexOf(item);
    const fullRange = vault.get({ id: range.id, type: "Range" });
    if (!fullRange) {
      console.error("Range not found", range.id);
      return;
    }

    const length = fullRange.items.length - index;
    const atIndex = (topLevelRange.items || []).indexOf(range) + 1;
    if (atIndex === -1) {
      console.error("Range not found", range.id);
      return;
    }

    let existingEmptyRange: { id: string; type: "Range" } | null = null;
    const existingRange = (topLevelRange.items || [])[atIndex];
    if (existingRange && existingRange.type === "Range") {
      const fullExistingRange = vault.get(existingRange);
      if (fullExistingRange.items.length === 0) {
        existingEmptyRange = { id: fullExistingRange.id, type: "Range" };
      }
    }

    const newRange = existingEmptyRange || (await createEmptyRange(atIndex));

    vault.dispatch(
      moveEntities({
        subjects: {
          type: "slice",
          startIndex: index,
          length: length,
        },
        from: {
          id: range.id,
          type: "Range",
          key: "items",
        },
        to: {
          id: newRange.id,
          type: "Range",
          key: "items",
          // index not specified - should append to end
        },
      }),
    );
  }
}
