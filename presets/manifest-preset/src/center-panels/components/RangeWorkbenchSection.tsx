import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import type { InternationalString } from "@iiif/presentation-3";
import {
  ActionButton,
  CanvasThumbnailGridItem,
  DeleteForeverIcon,
  EditTextIcon,
  ListingIcon,
  Modal,
  MoreMenuIcon,
  useGridOptions,
  useLoadMoreItems,
} from "@manifest-editor/components";
import { InlineLabelEditor } from "@manifest-editor/editors";
import { useLayoutActions } from "@manifest-editor/shell";
import { useCallback, useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components";
import { CanvasContext, LocaleString } from "react-iiif-vault";
import { ArrowForwardIcon } from "../../icons";
import { ChevronDownIcon } from "../../left-panels/components/ChevronDownIcon";
import { RangeGridThumbnail } from "./RangeGridThumbnail";
import { RangeWorkbenchCanvas } from "./RangeWorkbenchCanvas";

export function RangeWorkbenchSection({
  range,
  isSplitting,
  onSplit,
  onMergeDown,
  onMergeUp,
  mergeDownLabel,
  mergeUpLabel,
  nextRangeLabel,
  onDelete,
  idx,
}: {
  range: RangeTableOfContentsNode;
  isSplitting: boolean;
  onSplit: (
    range: RangeTableOfContentsNode,
    item: RangeTableOfContentsNode,
  ) => void;
  mergeUpLabel?: InternationalString | string | null;
  onMergeUp?: (range: RangeTableOfContentsNode, empty?: boolean) => void;
  mergeDownLabel?: InternationalString | string | null;
  onMergeDown?: (range: RangeTableOfContentsNode, empty?: boolean) => void;
  onDelete?: (range: RangeTableOfContentsNode) => void;
  nextRangeLabel?: string;
  idx: number;
}) {
  const [{ size }] = useGridOptions("default-grid-size", "grid-sm");

  const { edit } = useLayoutActions();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCanvas, _setSelectedCanvas] =
    useState<RangeTableOfContentsNode | null>(null);
  const [lastSelectedCanvas, setLastSelectedCanvas] =
    useState<RangeTableOfContentsNode | null>(null);

  const setSelectedCanvas = useCallback(
    (canvas: RangeTableOfContentsNode | null) => {
      _setSelectedCanvas(canvas);
      if (canvas) {
        setLastSelectedCanvas(canvas);
      }
    },
    [],
  );

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [rangeItems, { intersector, isFullyLoaded, loadMore, reset }] =
    useLoadMoreItems(range.items || [], {
      batchSize: 32,
    });

  const isEmpty = !range.items || range.items?.length === 0;

  const firstCanvasId = (range.items ?? []).find(i => i.type === "Canvas")?.id;


  return (
    <>
      {selectedCanvas ? (
        <Modal
          className="max-w-[90vw] w-full h-[90vh]"
          title={getValue(selectedCanvas.label) || "Canvas"}
          onClose={() => setSelectedCanvas(null)}
        >
          {selectedCanvas && (
            <RangeWorkbenchCanvas
              range={range}
              canvas={selectedCanvas}
              onBack={() => setSelectedCanvas(null)}
              setCanvas={setSelectedCanvas}
            />
          )}
        </Modal>
      ) : null}
      <div
        id={`workbench-${range.id}`}
        key={range.id}
        className="w-full border-b border-b-gray-200 p-4 border-t border-t-gray-300"
      >
        <div className="flex items-center gap-4">
          <Button
            className="flex items-center gap-2"
            onPress={() => {
              if (isExpanded) reset();
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon
              className="text-xl"
              style={{
                transition: "transform .2s",
                transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
              }}
            />
            {isEditingLabel ? null : (
              <LocaleString className="text-xl">
                {range.label || "Untitled range"}
              </LocaleString>
            )}
          </Button>

          {isEditingLabel ? (
            <InlineLabelEditor
              resource={{ id: range.id, type: "Range" }}
              onSubmit={() => setIsEditingLabel(false)}
              onCancel={() => setIsEditingLabel(false)}
            />
          ) : null}

          {!isEditingLabel ? (
            <ActionButton onPress={() => setIsEditingLabel(true)}>
              Edit
            </ActionButton>
          ) : null}

          <MenuTrigger>
            <ActionButton>
              <MoreMenuIcon className="text-xl" />
            </ActionButton>
            <Popover className="bg-white shadow-md rounded-md p-1">
              <Menu>
                <MenuItem
                  className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                  onAction={() =>
                    edit(
                      range,
                      { property: "metadata" },
                      {
                        forceOpen: true,
                        selectedTab: "@manifest-editor/metadata",
                      },
                    )
                  }
                >
                  <ListingIcon />
                  Edit range metadata
                </MenuItem>
                {!isEmpty && onMergeUp && (
                  <MenuItem
                    onPress={() => onMergeUp(range, true)}
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                  >
                    <MergeUpIcon className="text-md" /> Empty contents into
                    <LocaleString className="font-semibold">
                      {mergeUpLabel}
                    </LocaleString>
                  </MenuItem>
                )}
                {!isEmpty && onMergeDown && (
                  <MenuItem
                    onPress={() => onMergeDown(range, true)}
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center"
                  >
                    <MergeDownIcon className="text-md" /> Empty contents into
                    <LocaleString className="font-semibold">
                      {mergeDownLabel}
                    </LocaleString>
                  </MenuItem>
                )}
                {!isEmpty && <Separator className="h-0.5 bg-gray-200" />}
                {!isEmpty && onMergeUp && (
                  <MenuItem
                    onPress={() =>
                      window.confirm(
                        "This range will be removed and the items will be merged into the previous range.",
                      ) && onMergeUp(range)
                    }
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center text-red-500"
                  >
                    <MergeUpIcon className="text-md" /> Merge into
                    <LocaleString className="font-semibold">
                      {mergeUpLabel}
                    </LocaleString>
                  </MenuItem>
                )}
                {!isEmpty && onMergeDown && (
                  <MenuItem
                    onPress={() => {
                      window.confirm(
                        "This range will be removed and the items will be merged into the next range.",
                      ) && onMergeDown(range);
                    }}
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center text-red-500"
                  >
                    <MergeDownIcon className="text-md" /> Merge into
                    <LocaleString className="font-semibold">
                      {mergeDownLabel}
                    </LocaleString>
                  </MenuItem>
                )}
                {onMergeUp || onMergeDown ? (
                  <Separator className="h-0.5 bg-gray-200" />
                ) : null}
                {onDelete ? (
                  <MenuItem
                    onPress={() => {
                      (range.items?.length
                        ? window.confirm(
                            "This range and it's items will be removed.",
                          )
                        : true) && onDelete(range);
                    }}
                    className="hover:bg-gray-100 px-2 py-1 text-sm m-0.5 flex gap-2 items-center text-red-500"
                  >
                    <DeleteForeverIcon /> Delete range items
                  </MenuItem>
                ) : null}
              </Menu>
            </Popover>
          </MenuTrigger>

          <ActionButton onPress={() => edit({ id: range.id, type: "Range" })}>
            {range.isRangeLeaf ? "View range items" : "Edit range items"}
            <ArrowForwardIcon className="text-xl" />
          </ActionButton>
        </div>
        {isExpanded ? (
          <>
            <div className={`grid pt-4 gap-3 ${size}`}>
              {(rangeItems || []).map((item) => {
                const isFirstCanvas = item.id === firstCanvasId;
                if (item.type !== "Canvas") {
                  return (
                    <div
                      key={item.id}
                      className="items-center justify-center flex flex-col"
                    >
                      <RangeGridThumbnail range={item} />
                      <LocaleString className="text-center truncate overflow-ellipsis max-w-full text-sm">
                        {item.label || "Untitled range"}
                      </LocaleString>
                    </div>
                  );
                }

                return (
                  <CanvasContext
                    key={item.id}
                    canvas={item.resource!.source!.id}
                  >
                    <CanvasThumbnailGridItem
                      selected={item.id === lastSelectedCanvas?.id}
                      aria-disabled={item.id === firstCanvasId}
                      onClick={() => {
                        if (isSplitting && !isFirstCanvas) {
                          onSplit(range, item);
                        }
                      }}
                      containerProps={{
                        "data-range1-label": getValue(range.label),
                        "data-range2-label": nextRangeLabel || "Untitled range",
                        ...(isFirstCanvas ? { "data-split-first": "true" } : {}),
                      }}
                      className={isSplitting ? "split-range-highlight" : ""}
                      id={item.resource!.source!.id}
                      icon={
                        <ActionButton
                          className="absolute top-2 right-2 hidden group-hover:block"
                          onPress={() => setSelectedCanvas(item)}
                        >
                          <CanvasPreviewIcon className="text-2xl" />
                        </ActionButton>
                      }
                    />
                  </CanvasContext>
                );
              })}
            </div>
            {!isFullyLoaded ? (
              <ActionButton onPress={loadMore}>Load more</ActionButton>
            ) : null}
          </>
        ) : null}
      </div>
      {intersector}
    </>
  );
}

export function CanvasPreviewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M21 8.59V4c0-.55-.45-1-1-1h-4.59c-.89 0-1.34 1.08-.71 1.71l1.59 1.59l-10 10l-1.59-1.59c-.62-.63-1.7-.19-1.7.7V20c0 .55.45 1 1 1h4.59c.89 0 1.34-1.08.71-1.71L7.71 17.7l10-10l1.59 1.59c.62.63 1.7.19 1.7-.7"
      />
    </svg>
  );
}

export function MergeUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="m4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
      />
    </svg>
  );
}

export function MergeDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="m20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z"
      />
    </svg>
  );
}
