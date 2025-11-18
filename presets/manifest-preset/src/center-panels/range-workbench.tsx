import {
  createRangeHelper,
  getValue,
  type RangeTableOfContentsNode,
} from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import type { InternationalString } from "@iiif/presentation-3";
import {
  ActionButton,
  InfoMessage,
  MoreMenuIcon,
  useGridOptions,
} from "@manifest-editor/components";
import { InlineLabelEditor, useInStack } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useEditingStack,
  useGenericEditor,
  useInlineCreator,
  useLayoutActions,
} from "@manifest-editor/shell";
import { EditIcon } from "@manifest-editor/ui/icons/EditIcon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import {
  LocaleString,
  RangeContext,
  useManifest,
  useVault,
  useVaultSelector,
} from "react-iiif-vault";
import { SplitRangeIcon } from "../icons";
import { ArrowDownIcon } from "../left-panels/components/ArrowDownIcon";
import { ArrowUpIcon } from "../left-panels/components/ArrowUpIcon";
import { useRangeSplittingStore } from "../store/range-splitting-store";
import { BulkActionsWorkbench } from "./components/BulkActionsWorkbench";
import { RangeOnboarding } from "./components/RangeOnboarding";
import { RangeWorkbenchSection } from "./components/RangeWorkbenchSection";
import { RangeWorkbenchCanvas } from "./components/RangeWorkbenchCanvas";

export const rangeWorkbench: LayoutPanel = {
  id: "range-workbench",
  label: "Range Workbench",
  icon: "",
  render: () => <RangeWorkbench />,
};

function getNextRangeLabel(label: InternationalString | null) {
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
  const [{ size }, gridOptions] = useGridOptions(
    "default-grid-size",
    "grid-sm",
  );
  const vault = useVault();
  const manifest = useManifest();
  const helper = useMemo(() => createRangeHelper(vault), [vault]);
  const creator = useInlineCreator();
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const [preview, setPreview] = useState<{
    range: RangeTableOfContentsNode;
    canvas: RangeTableOfContentsNode;
  } | null>(null);

  const handlePreviewCanvas = useCallback(
    (range: RangeTableOfContentsNode, canvas: RangeTableOfContentsNode) => {
      setPreview({ range, canvas });
    },
    [],
  );

  const { isSplitting, setIsSplitting, splitEffect } = useRangeSplittingStore();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Hook needs it.
  useEffect(splitEffect, [selectedRange]);

  const topLevelRange = useVaultSelector(
    (_, vault) => {
      const selected = toRef<any>(selectedRange?.resource);
      if (selected) {
        return helper.rangeToTableOfContentsTree(vault.get(selected)!, {
          showNoNav: true,
        });
      }

      if (!manifest!.structures) {
        return null;
      }

      const structures = vault.get(manifest!.structures || []);
      return (
        helper.rangesToTableOfContentsTree(structures, undefined, {
          showNoNav: true,
        })! || null
      );
    },
    [manifest, selectedRange],
  );
  useEffect(() => {
    if (!topLevelRange) {
      setPreview(null);
      return;
    }

    const items = topLevelRange.items || [];
    const firstCanvas = items.find((item: any) => item.type === "Canvas");

    if (firstCanvas) {
      setPreview((prev) => {
        if (
          prev &&
          prev.range.id === topLevelRange.id &&
          prev.canvas.id === firstCanvas.id
        )
          return prev;
        return {
          range: topLevelRange as RangeTableOfContentsNode,
          canvas: firstCanvas as RangeTableOfContentsNode,
        };
      });
    } else {
      setPreview(null);
    }
  }, [topLevelRange?.id]);

  const rangeEditor = useGenericEditor(
    topLevelRange?.id ? { id: topLevelRange?.id!, type: "Range" } : undefined,
    {
      allowNull: true,
    },
  );

  const onMerge = useCallback(
    (
      mergeRange: RangeTableOfContentsNode,
      toMergeRange: RangeTableOfContentsNode,
      empty?: boolean,
    ) => {
      rangeEditor.structural.ranges.mergeRanges(
        mergeRange,
        toMergeRange,
        empty,
      );
    },
    [rangeEditor],
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

      await rangeEditor.structural.ranges.splitRange(
        topLevelRange,
        range,
        item,
        (atIndex: number) =>
          creator.create(
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
          ) as Promise<{ id: string; type: "Range" }>,
      );
    },
    [topLevelRange, rangeEditor, creator],
  );

  const { edit } = useLayoutActions();
  const { back } = useEditingStack();

  const [isLastInView, setIsLastInView] = useState(false); // multi-section: last section visible within container
  const [isAtEnd, setIsAtEnd] = useState(false); // single or multi: end of container reached

  const rangeItems = (topLevelRange?.items ?? []).filter(
    (item: any): item is { id: string; type: "Range" } => item.type === "Range",
  );
  const rangeItemsLen = rangeItems.length;

  useEffect(() => {
    if (typeof window === "undefined" || rangeItemsLen === 0) {
      setIsLastInView(false);
      return;
    }
    const container = document.getElementById(
      "range-workbench-scroll",
    ) as HTMLElement | null;
    const lastId = rangeItems[rangeItems.length - 1]?.id;
    const last = lastId
      ? (document.getElementById(`workbench-${lastId}`) as HTMLElement | null)
      : null;
    if (!container || !last) return;

    const io = new IntersectionObserver(
      ([entry]) => setIsLastInView(entry!.isIntersecting),
      {
        root: container,
        threshold: 0,
        rootMargin: "0px 0px -1px 0px",
      },
    );

    io.observe(last);

    const r = last.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const visible = r.top < cr.bottom && r.bottom > cr.top;
    setIsLastInView(!!visible);

    return () => io.disconnect();
  }, [rangeItemsLen, rangeItems]);

  useEffect(() => {
    const el = document.getElementById(
      "range-workbench-scroll",
    ) as HTMLElement | null;
    if (!el) return;

    const compute = () => {
      const { scrollTop, clientHeight, scrollHeight } = el;
      setIsAtEnd(scrollTop + clientHeight >= scrollHeight - 2);
    };

    const raf = requestAnimationFrame(compute);
    el.addEventListener("scroll", compute);
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      ro.disconnect();
    };
  }, [topLevelRange?.id, rangeItemsLen, isSplitting, size]);

  if (!topLevelRange) {
    return null;
  }

  const hasCanvases = (topLevelRange.items || []).filter(
    (item) => item.type === "Canvas",
  );

  const firstId = rangeItems[0]?.id;
  const lastId = rangeItems[rangeItems.length - 1]?.id;

  const firstWorkbench = firstId
    ? document.getElementById(`workbench-${firstId}`)
    : null;
  const lastWorkbench = lastId
    ? document.getElementById(`workbench-bottom`)
    : null;

  const rootToc = useVaultSelector(
    (_, v) => {
      if (!manifest?.structures) return null;
      const structures = v.get(manifest.structures || []);
      return (
        helper.rangesToTableOfContentsTree(structures, undefined, {
          showNoNav: true,
        }) || null
      );
    },
    [manifest],
  );

  const parentIndex = useMemo(() => {
    const map = new Map<string, string>();

    const walk = (node?: any) => {
      if (!node?.items) return;
      for (const item of node.items) {
        if (item?.type === "Range") {
          map.set(item.id, node.id);
          walk(item);
        }
      }
    };
    if (rootToc) {
      walk(rootToc);
    }

    return map;
  }, [rootToc]);

  const selectedId =
    toRef<any>(selectedRange?.resource)?.id ??
    (selectedRange?.resource as any)?.id ??
    null;

  const goToParent = useCallback(() => {
    if (!selectedId) {
      back();
      return;
    }
    const parentId = parentIndex.get(selectedId);
    if (parentId) {
      edit({ id: parentId, type: "Range" });
    } else {
      back();
    }
  }, [selectedId, parentIndex, edit, back]);

  const hasParent = useMemo(
    () => !!(selectedId && parentIndex.has(selectedId)),
    [selectedId, parentIndex],
  );

  return (
    <div id="range-workbench-scroll" className="flex-1 overflow-y-auto">
      {!preview && (
        <div className="z-50 flex flex-row justify-between bg-me-primary-500 sticky top-0 h-16 px-4 z-20 border-b-white border-b">
          <div className="flex items-center gap-4">
            {hasParent ? (
              <ActionButton onPress={() => goToParent()}>
                <ArrowUpIcon className="text-xl" />
              </ActionButton>
            ) : null}
            {isEditingLabel && !topLevelRange.isVirtual ? (
              <InlineLabelEditor
                className=""
                resource={topLevelRange}
                onSubmit={() => setIsEditingLabel(false)}
                onCancel={() => setIsEditingLabel(false)}
              />
            ) : (
              <LocaleString as="h3" className="text-xl text-white">
                {topLevelRange.label}
              </LocaleString>
            )}
            <MenuTrigger>
              <ActionButton>
                <MoreMenuIcon className="text-xl" />
              </ActionButton>
              <Popover className="bg-white shadow-md rounded-md p-1">
                <Menu>
                  <MenuItem
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                    onAction={() => setIsEditingLabel(true)}
                  >
                    <EditIcon />
                    Edit range label
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
            {!isSplitting &&
              (topLevelRange?.items?.length ?? 0) > 0 &&
              !topLevelRange.isRangeLeaf && (
                <ActionButton onPress={() => setIsSplitting(true)}>
                  <SplitRangeIcon className="text-xl" /> Split range
                </ActionButton>
              )}

            <RangeOnboarding />
          </div>

          {gridOptions}
        </div>
      )}

      {isSplitting ? (
        <InfoMessage className="my-4 flex gap-4 sticky top-2 z-20">
          Splitting range, click to confirm the the new range item
          <ActionButton onPress={() => setIsSplitting(false)}>
            Exit splitting mode
          </ActionButton>
        </InfoMessage>
      ) : null}

      {preview && (
        <div className="border-b border-gray-200">
          <div className="flex bg-white sticky top-0 h-16 px-4 z-20 border-b-white border-b items-center gap-4">
            {isEditingLabel ? (
              <InlineLabelEditor
                className="text-base font-normal mt-1"
                resource={preview.range}
                onSubmit={() => setIsEditingLabel(false)}
                onCancel={() => setIsEditingLabel(false)}
              />
            ) : (
              <>
                {isEditingLabel ? null : (
                  <LocaleString className="text-xl text-left truncate overflow-ellipsis min-w-0">
                    {preview.range.label || "Untitled range"}
                  </LocaleString>
                )}
                <MenuTrigger>
                  <ActionButton>
                    <MoreMenuIcon className="text-xl" />
                  </ActionButton>
                  <Popover className="bg-white shadow-md rounded-md p-1">
                    <Menu>
                      <MenuItem
                        className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                        onAction={() => setIsEditingLabel(true)}
                      >
                        <EditIcon />
                        Edit range label
                      </MenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </>
            )}
          </div>
          <RangeWorkbenchCanvas
            range={preview.range}
            canvas={preview.canvas}
            onBack={() => setPreview(null)}
            setCanvas={(canvas) =>
              setPreview((prev) => (prev ? { ...prev, canvas } : prev))
            }
          />
        </div>
      )}
      {!preview &&
        (topLevelRange.items || []).map((item, idx) => {
          if (item.type === "Canvas") {
            return null;
          }

          const prevIdx = idx - 1;
          const nextIdx = idx + 1;

          const nextRangeLabel =
            nextIdx !== topLevelRange.items?.length &&
            topLevelRange.items?.[nextIdx]?.items?.length === 0
              ? getValue(topLevelRange.items?.[nextIdx]?.label)
              : getNextRangeLabel(item.label);

          return (
            <RangeWorkbenchSection
              key={item.id}
              idx={idx}
              isSplitting={isSplitting}
              onSplit={onSplit}
              range={item}
              onMergeUp={
                idx !== 0
                  ? (r, empty) =>
                      onMerge(item, topLevelRange.items?.[prevIdx]!, empty)
                  : undefined
              }
              onMergeDown={
                topLevelRange.items?.[nextIdx]
                  ? (r, empty) =>
                      onMerge(item, topLevelRange.items?.[nextIdx]!, empty)
                  : undefined
              }
              nextRangeLabel={nextRangeLabel}
              onDelete={() => onDelete(idx)}
              mergeUpLabel={
                prevIdx !== -1 ? topLevelRange.items?.[prevIdx]?.label : ""
              }
              mergeDownLabel={
                nextIdx !== topLevelRange.items?.length
                  ? topLevelRange.items?.[nextIdx]?.label
                  : ""
              }
              onPreviewCanvas={handlePreviewCanvas}
            />
          );
        })}

      {!preview && hasCanvases.length ? (
        <RangeContext range={topLevelRange.id}>
          <BulkActionsWorkbench />
        </RangeContext>
      ) : null}

      {!preview && rangeItems.length === 1 ? (
        <div className="sticky bottom-5 float-right right-5">
          {isAtEnd ? (
            <ActionButton
              primary
              onPress={() => {
                const el = document.getElementById(
                  "range-workbench-scroll",
                ) as HTMLElement | null;
                el?.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Scroll to top <ArrowUpIcon />
            </ActionButton>
          ) : (
            <ActionButton
              primary
              onPress={() => {
                // scroll single section to its end (keeps your previous feel)
                if (lastWorkbench) {
                  lastWorkbench.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "end",
                  });
                } else {
                  const el = document.getElementById(
                    "range-workbench-scroll",
                  ) as HTMLElement | null;
                  el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
                }
              }}
            >
              Scroll to bottom <ArrowDownIcon />
            </ActionButton>
          )}
        </div>
      ) : firstWorkbench && lastWorkbench && firstId !== lastId ? (
        <div className="sticky bottom-5 float-right right-5">
          {isLastInView ? (
            <ActionButton
              primary
              onPress={() => {
                firstWorkbench?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "start",
                });
              }}
            >
              Scroll to top <ArrowUpIcon />
            </ActionButton>
          ) : (
            <ActionButton
              primary
              onPress={() => {
                lastWorkbench?.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                  inline: "end",
                });
              }}
            >
              Scroll to bottom <ArrowDownIcon />
            </ActionButton>
          )}
        </div>
      ) : null}
      <div id="workbench-bottom" />
    </div>
  );
}
