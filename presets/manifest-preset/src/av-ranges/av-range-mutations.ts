import {
  batchActions,
  entityActions,
  importEntities,
  addMappings,
} from "@iiif/helpers/vault/actions";
import type { Vault } from "@iiif/helpers/vault";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import {
  createTemporalCanvasReference,
  makeRangeId,
  type TemporalRangeSegment,
} from "./temporal-range-utils";

export function createTemporalRange(
  vault: Vault,
  manifest: any,
  data: {
    canvasId: string;
    start: number;
    end: number;
    label: InternationalString;
    behavior?: string[];
    atIndex?: number;
  },
) {
  const rangeId = makeRangeId(manifest.id);
  const range = {
    id: rangeId,
    type: "Range",
    label: data.label,
    behavior: data.behavior?.length ? data.behavior : undefined,
    items: [createTemporalCanvasReference(data.canvasId, data.start, data.end)],
  };
  const reference = { id: rangeId, type: "Range" } as Reference<"Range">;

  vault.dispatch(
    batchActions({
      actions: [
        importEntities({
          entities: {
            Range: {
              [rangeId]: range,
            },
          },
        }),
        addMappings({
          mapping: {
            [rangeId]: "Range",
          },
        }),
        entityActions.addReference({
          id: manifest.id,
          type: "Manifest",
          key: "structures",
          reference,
          index: data.atIndex,
        }),
      ],
    }),
  );

  return reference;
}

export function updateTemporalRange(
  vault: Vault,
  segment: TemporalRangeSegment,
  data: {
    label?: InternationalString;
    start?: number;
    end?: number;
    behavior?: string[];
  },
) {
  const start = data.start ?? segment.start;
  const end = data.end ?? segment.end;
  const item = createTemporalCanvasReference(segment.canvasId, start, end);

  vault.batch(() => {
    if (data.label) {
      vault.modifyEntityField(segment.rangeRef, "label", data.label);
    }
    if (data.behavior) {
      vault.modifyEntityField(
        segment.rangeRef,
        "behavior",
        data.behavior.length ? data.behavior : undefined,
      );
    }
    vault.dispatch(
      entityActions.updateReference({
        id: segment.rangeRef.id,
        type: "Range",
        key: "items",
        index: segment.itemIndex,
        reference: item,
      }),
    );
  });
}

export function deleteTemporalRange(
  vault: Vault,
  segment: TemporalRangeSegment,
) {
  vault.dispatch(
    entityActions.removeReference({
      id: segment.parentRef.id,
      type: segment.parentRef.type as any,
      key: segment.parentKey,
      index: segment.parentIndex,
      reference: segment.rangeRef,
    }),
  );
}
