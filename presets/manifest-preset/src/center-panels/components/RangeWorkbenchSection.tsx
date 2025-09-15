import { getValue, type RangeTableOfContentsNode } from "@iiif/helpers";
import { ActionButton, CanvasThumbnailGridItem, Modal, RangesIcon, useFastList } from "@manifest-editor/components";
import { Input, LanguageFieldEditor, LanguageMapEditor } from "@manifest-editor/editors";
import { useGenericEditor, useLayoutActions } from "@manifest-editor/shell";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { CanvasContext, LocaleString } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ListEditIcon } from "../../components";
import { ArrowDownIcon } from "../../left-panels/components/ArrowDownIcon";
import { RangeWorkbenchCanvas } from "./RangeWorkbenchCanvas";

function useLoadMoreItems<T extends object>(
  items: T[],
  options: {
    batchSize: number;
  },
) {
  const [index, setIndex] = useState(options.batchSize);

  const itemsFiltered = useMemo(() => {
    return items.slice(0, index);
  }, [items, index]);

  const loadMore = useCallback(() => {
    setIndex((prevIndex) => prevIndex + options.batchSize);
  }, [options.batchSize]);

  const intersector = useMemo(
    () => (
      <div
        style={{ width: 1, height: 1 }}
        ref={(intersectorRef) => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting) {
                loadMore();
              }
            },
            { root: intersectorRef?.parentElement, threshold: 0.1 },
          );

          if (intersectorRef) {
            observer.observe(intersectorRef);
          }

          return () => {
            if (intersectorRef) {
              observer.unobserve(intersectorRef);
            }
          };
        }}
      />
    ),
    [loadMore],
  );

  const isFullyLoaded = index >= items.length;

  const reset = () => {
    setIndex(options.batchSize);
  };

  return [
    isFullyLoaded ? items : itemsFiltered,
    { intersector: isFullyLoaded ? null : intersector, loadMore, isFullyLoaded, reset },
  ] as const;
}

export function RangeWorkbenchSection({
  range,
  isSplitting,
  onSplit,
  onMergeDown,
  onMergeUp,
}: {
  range: RangeTableOfContentsNode;
  isSplitting: boolean;
  onSplit: (range: RangeTableOfContentsNode, item: RangeTableOfContentsNode) => void;
  onMergeUp?: (range: RangeTableOfContentsNode) => void;
  onMergeDown?: (range: RangeTableOfContentsNode) => void;
}) {
  const { edit } = useLayoutActions();
  const [isExpanded, setIsExpanded] = useState(true);
  const rangeEditor = useGenericEditor(range);
  const [selectedCanvas, _setSelectedCanvas] = useState<RangeTableOfContentsNode | null>(null);
  const [lastSelectedCanvas, setLastSelectedCanvas] = useState<RangeTableOfContentsNode | null>(null);

  const setSelectedCanvas = useCallback((canvas: RangeTableOfContentsNode | null) => {
    _setSelectedCanvas(canvas);
    if (canvas) {
      setLastSelectedCanvas(canvas);
    }
  }, []);

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [rangeItems, { intersector, isFullyLoaded, loadMore, reset }] = useLoadMoreItems(range.items || [], {
    batchSize: 32,
  });
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
      <div key={range.id} className="w-full border-b border-b-gray-200 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            className="flex items-center gap-2"
            onPress={() => {
              if (isExpanded) reset();
              setIsExpanded(!isExpanded);
            }}
          >
            <ArrowDownIcon
              className="text-xl"
              style={{
                transition: "transform .2s",
                transform: `rotate(${isExpanded ? "0deg" : "-90deg"})`,
              }}
            />
            {isEditingLabel ? null : <LocaleString className="text-xl">{range.label || "Untitled range"}</LocaleString>}
          </Button>

          {isEditingLabel ? (
            <form
              className={twMerge("flex gap-2 items-center justify-center w-full max-w-xl")}
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditingLabel(false);
              }}
            >
              <LanguageFieldEditor
                singleValue
                autoFocus
                className="mb-0 w-full"
                label=""
                fields={rangeEditor.descriptive.label.get()}
                onSave={(e) => rangeEditor.descriptive.label.set(e.toInternationalString())}
                disableMultiline={true}
                disallowHTML={true}
              />
              <ActionButton primary type="submit">
                Save
              </ActionButton>
            </form>
          ) : null}

          {isEditingLabel ? null : (
            <ActionButton onPress={() => setIsEditingLabel((ed) => !ed)}>
              <ListEditIcon className="text-2xl" />
            </ActionButton>
          )}
          <ActionButton onPress={() => edit({ id: range.id, type: "Range" })}>
            {range.isRangeLeaf ? "Bulk actions" : "Edit range"}
          </ActionButton>

          {onMergeUp ? (
            <ActionButton onPress={() => onMergeUp(range)}>
              <MergeUpIcon className="text-2xl" /> Merge with previous
            </ActionButton>
          ) : null}
          {onMergeDown ? (
            <ActionButton onPress={() => onMergeDown(range)}>
              <MergeDownIcon className="text-2xl" /> Merge with next
            </ActionButton>
          ) : null}
        </div>
        {isExpanded ? (
          <>
            <div className="grid grid-sm gap-3">
              {(rangeItems || []).map((item) => {
                if (item.type !== "Canvas") {
                  return (
                    <div
                      key={item.id}
                      className="aspect-square bg-gray-100 rounded items-center justify-center flex flex-col"
                    >
                      <RangesIcon className="w-12 h-12" />
                      <LocaleString>{item.label || "Untitled range"}</LocaleString>
                      <ActionButton onPress={() => edit({ id: item.id, type: "Range" })}>
                        {item.isRangeLeaf ? "Bulk actions" : "Edit range"}
                      </ActionButton>
                    </div>
                  );
                }

                return (
                  <CanvasContext key={item.id} canvas={item.resource!.source!.id}>
                    <CanvasThumbnailGridItem
                      selected={item.id === lastSelectedCanvas?.id}
                      onClick={() => {
                        if (isSplitting) {
                          onSplit(range, item);
                        }
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
            {!isFullyLoaded ? <ActionButton onPress={loadMore}>Load more</ActionButton> : null}
          </>
        ) : null}
      </div>
      {intersector}
    </>
  );
}

export function CanvasPreviewIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path fill="currentColor" d="m4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z" />
    </svg>
  );
}

export function MergeDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE */}
      <path fill="currentColor" d="m20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8z" />
    </svg>
  );
}
