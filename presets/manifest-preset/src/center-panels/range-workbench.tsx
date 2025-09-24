import { createRangeHelper, getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { moveEntities } from "@iiif/helpers/vault/actions";
import { toRef } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, BackIcon, InfoMessage, useGridOptions } from "@manifest-editor/components";
import { InlineLabelEditor, useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useEditingStack,
  useGenericEditor,
  useInlineCreator,
  useLayoutActions,
} from "@manifest-editor/shell";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LocaleString, RangeContext, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { SplitRangeIcon } from "../icons";
import { ArrowDownIcon } from "../left-panels/components/ArrowDownIcon";
import { ArrowUpIcon } from "../left-panels/components/ArrowUpIcon";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { BulkActionsWorkbench } from "./components/BulkActionsWorkbench";
import { RangeOnboarding } from "./components/RangeOnboarding";
import { RangeWorkbenchSection } from "./components/RangeWorkbenchSection";

export const rangeWorkbench: LayoutPanel = {
  id: "range-workbench",
  label: "Range Workbench",
  icon: "",
  render: () => <RangeWorkbench />,
};

function getNextRangeLabel(label: InternationalString | null) {
  // Example: "Page 1" or "Range 1" or "Chapter 1" should return "Page 2" or "Range 2" or "Chapter 2"
  const valueAsString = getValue(label);

  if (!valueAsString) {
    return "Untitled range";
  }

  const match = valueAsString.match(/(.+)(\d+)/);

  if (!match) {
    return "Untitled range";
  }

  const number = match?.[2] ? parseInt(match[2], 10) : 1;
  return `${match ? match[1] : ""}${number + 1}`;
}

function RangeWorkbench() {
  const selectedRange = useInStack("Range");
  const [{ size }, gridOptions] = useGridOptions("default-grid-size", "grid-sm");
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const creator = useInlineCreator();
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const { isSplitting, setIsSplitting, splitEffect } = useRangeSplittingStore();

  useEffect(splitEffect, [selectedRange]);

  const topLevelRange = useVaultSelector(
    (_, vault) => {
      const selected = toRef<any>(selectedRange?.resource);
      if (selected) {
        return helper.rangeToTableOfContentsTree(vault.get(selected)!, { showNoNav: true });
      }

      if (!manifest!.structures) {
        return null;
      }

      const structures = vault.get(manifest!.structures || []);
      return helper.rangesToTableOfContentsTree(structures, undefined, { showNoNav: true })! || null;
    },
    [manifest, selectedRange],
  );

  const rangeEditor = useGenericEditor(topLevelRange?.id ? { id: topLevelRange?.id!, type: "Range" } : undefined, {
    allowNull: true,
  });

  const onMerge = useCallback(
    (mergeRange: RangeTableOfContentsNode, toMergeRange: RangeTableOfContentsNode, empty?: boolean) => {
      if (mergeRange.type !== "Range" || toMergeRange.type !== "Range") return;

      const foundIndex = rangeEditor.structural.items
        .getWithoutTracking()
        .findIndex((item) => toRef(item)?.id === mergeRange.id);

      if (foundIndex === -1) {
        console.error(`Range ${mergeRange.id} not found in ${toMergeRange.id}`);
        return;
      }

      const fullMergeRange = vault.get({ id: mergeRange.id, type: "Range" });

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
        rangeEditor.structural.items.deleteAtIndex(foundIndex);
      }
    },
    [vault, rangeEditor],
  );

  const onDelete = useCallback(
    async (indexToDelete: number) => {
      if (indexToDelete === -1) return;
      rangeEditor.structural.items.deleteAtIndex(indexToDelete);
    },
    [rangeEditor],
  );

  const onSplit = useCallback(
    async (range: RangeTableOfContentsNode, item: RangeTableOfContentsNode) => {
      if (!topLevelRange) {
        return;
      }

      // @todo Batch all of these actions as one.

      const index = (range.items || []).indexOf(item);
      const fullRange = vault.get({ id: range.id, type: "Range" });
      if (!fullRange) {
        console.error("Range not found", range.id);
        return;
      }

      const length = fullRange.items.length - index;

      // // 1. Remove the items
      // const slicedItems = fullRange.items!.slice(index);
      // const rangeEditor = new EditorInstance({
      //   reference: { id: range.id, type: "Range" },
      //   vault,
      // });

      // if (slicedItems.length === 0 || slicedItems.length === fullRange.items!.length) {
      //   console.error("No items to split");
      //   return;
      // }

      // for (let i = index; i < fullRange.items.length; i++) {
      //   rangeEditor.structural.items.deleteAtIndex(index);
      // }
      // // 2. Create new range, with new items.

      const atIndex = (topLevelRange.items || []).indexOf(range) + 1;
      if (atIndex === -1) {
        console.error("Range not found", range.id);
        return;
      }

      let existingEmptyRange: { id: string; type: "Range" } | null = null;
      // Check if there is an empty range after.
      const existingRange = (topLevelRange.items || [])[atIndex];
      if (existingRange && existingRange.type === "Range") {
        const fullExistingRange = vault.get(existingRange);
        if (fullExistingRange.items.length === 0) {
          existingEmptyRange = { id: fullExistingRange.id, type: "Range" };
        }
      }

      // slicedItems
      const newRange =
        existingEmptyRange ||
        ((await creator.create(
          "@manifest-editor/range-with-items",
          {
            type: "Range",
            label: { en: [getNextRangeLabel(range.label)] },
            items: [],
          },
          {
            parent: {
              property: "items",
              resource: { id: topLevelRange.id, type: "Range" },
              atIndex,
            },
          },
        )) as { id: string; type: "Range" });

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
    },
    [topLevelRange, vault, creator],
  );

  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  const [isLastInView, setIsLastInView] = useState(false);

  const rangeItemsLen = (topLevelRange?.items || []).filter((i: any) => i.type !== "Canvas").length;

  useEffect(() => {
    if (typeof window === "undefined" || rangeItemsLen === 0) {
      setIsLastInView(false);
      return;
    }
    const lastId = rangeItems[rangeItems.length - 1]?.id;
    const last = document.getElementById(`workbench-${lastId}`);
    if (!last) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsLastInView(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -1px 0px",
      },
    );

    io.observe(last);

    const r = last.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    setIsLastInView(r.top < vh && r.bottom > 0);

    return () => io.disconnect();
  }, [rangeItemsLen]);

  if (!topLevelRange) {
    return null;
  }

  const hasCanvases = (topLevelRange.items || []).filter((item) => item.type === "Canvas");

  const rangeItems = (topLevelRange.items ?? []).filter(
    (item): item is { id: string; type: "Range" } => item.type === "Range",
  );

  const firstId = rangeItems[0]?.id;
  const lastId = rangeItems[rangeItems.length - 1]?.id;

  const firstWorkbench = firstId ? document.getElementById(`workbench-${firstId}`) : null;
  const lastWorkbench = lastId ? document.getElementById(`workbench-${lastId}`) : null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-row justify-between bg-white/90 sticky top-0 h-16 px-4 z-20 border-b-white border-b">
        <div className="flex items-center gap-4">
          {selectedRange ? (
            <ActionButton onPress={() => back()}>
              <BackIcon className="text-xl" />
            </ActionButton>
          ) : null}
          {isEditingLabel && !topLevelRange.isVirtual ? (
            <InlineLabelEditor
              className="m-0 pt-2"
              resource={topLevelRange}
              onSubmit={() => setIsEditingLabel(false)}
              onCancel={() => setIsEditingLabel(false)}
            />
          ) : (
            <div className="flex items-center gap-4">
              <LocaleString as="h3" className="text-xl">
                {topLevelRange.label}
              </LocaleString>
              <ActionButton onPress={() => setIsEditingLabel(true)}>Edit</ActionButton>
            </div>
          )}
          {!isSplitting && (topLevelRange?.items?.length ?? 0) > 0 && (
            <ActionButton onPress={() => setIsSplitting(true)}>
              <SplitRangeIcon className="text-xl" /> Split range
            </ActionButton>
          )}

          <RangeOnboarding />
        </div>

        {gridOptions}
      </div>

      {isSplitting ? (
        <InfoMessage className="my-4 flex gap-4 sticky top-2 z-20">
          Splitting range, click to confirm the two new ranges
          <ActionButton onPress={() => setIsSplitting(false)}>Exit splitting mode</ActionButton>
        </InfoMessage>
      ) : null}

      {(topLevelRange.items || []).map((item, idx) => {
        if (item.type === "Canvas") {
          return null;
        }

        const prevIdx = idx - 1;
        const nextIdx = idx + 1;
        const previousRange = prevIdx >= 0 ? topLevelRange.items?.[prevIdx]! : null;

        const nextRangeLabel =
          nextIdx !== topLevelRange.items?.length && topLevelRange.items?.[nextIdx]?.items?.length === 0
            ? getValue(topLevelRange.items?.[nextIdx]?.label)
            : getNextRangeLabel(item.label);

        return (
          <RangeWorkbenchSection
            //
            idx={idx}
            isSplitting={isSplitting}
            onSplit={onSplit}
            key={item.id}
            range={item}
            onMergeUp={idx !== 0 ? (r, empty) => onMerge(item, topLevelRange.items?.[prevIdx]!, empty) : undefined}
            onMergeDown={
              topLevelRange.items?.[nextIdx]
                ? (r, empty) => onMerge(item, topLevelRange.items?.[nextIdx]!, empty)
                : undefined
            }
            nextRangeLabel={nextRangeLabel}
            onDelete={() => onDelete(idx)}
            mergeUpLabel={prevIdx !== -1 ? topLevelRange.items?.[prevIdx]?.label : ""}
            mergeDownLabel={nextIdx !== topLevelRange.items?.length ? topLevelRange.items?.[nextIdx]?.label : ""}
          />
        );
      })}

      {hasCanvases.length ? (
        <RangeContext range={topLevelRange.id}>
          <BulkActionsWorkbench />
        </RangeContext>
      ) : null}

      <div className="sticky bottom-5 float-right right-5 ">
        {isLastInView ? (
          <ActionButton
            primary
            onPress={() => {
              firstWorkbench?.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
            }}
          >
            Scroll to top <ArrowUpIcon />
          </ActionButton>
        ) : (
          <ActionButton
            primary
            onPress={() => {
              lastWorkbench?.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
            }}
          >
            Scroll to bottom <ArrowDownIcon />
          </ActionButton>
        )}
      </div>
    </div>
  );
}
