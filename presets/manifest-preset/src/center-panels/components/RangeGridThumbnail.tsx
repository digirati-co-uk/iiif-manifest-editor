import { createRangeHelper } from "@iiif/helpers";
import { CanvasThumbnailGridItem, RangesIcon } from "@manifest-editor/components";
import { memo, useMemo } from "react";
import { useDrag } from "react-aria";
import { useRange, useVault } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";

export const RangeGridThumbnail = memo(function RangeGridThumbnail(props: {
  dragState?: any;
  range: { id: string; type: string };
}) {
  const range = useRange({ id: props.range.id });
  const { dragProps } = useDrag({
    isDisabled: !props.dragState,
    getItems() {
      return [
        {
          "text/plain": JSON.stringify(props.dragState),
        },
      ];
    },
  });
  const vault = useVault();
  const canvases = useMemo(() => {
    if (!range) return [];
    const canvases = createRangeHelper(vault).findAllCanvasesInRange(range);
    // bug with the helper.
    const seenCanvasIds: string[] = [];
    const deDuplicatedCanvases = [];

    for (const canvas of canvases) {
      if (!seenCanvasIds.includes(canvas.id)) {
        seenCanvasIds.push(canvas.id);
        deDuplicatedCanvases.push(canvas);
      }
    }

    return deDuplicatedCanvases;
  }, [range, vault]);

  if (canvases.length === 0) return <div>EMPTY</div>;

  return (
    <div
      {...dragProps}
      className={twMerge(
        "grid relative grid-cols-2 grid-rows-2 aspect-square overflow-hidden w-full gap-1 p-1 bg-gray-300 rounded-md",
        canvases.length === 1 && "grid-cols-1 grid-rows-1",
        canvases.length === 2 && "grid-cols-1 grid-rows-2",
        canvases.length === 3 && "grid-cols-2 grid-rows-2",
        canvases.length === 4 && "grid-cols-2 grid-rows-2",
      )}
    >
      <div className="absolute bottom-2 left-2 bg-white/80 p-1 rounded z-20 flex items-center justify-center text-black/50">
        <RangesIcon className="w-5 h-5" />
      </div>
      {canvases.slice(0, 4).map((canvas, index) => (
        <CanvasThumbnailGridItem
          key={index}
          className={twMerge("rounded", canvases.length === 3 && index === 2 && "col-span-2")}
          hideLabel
          id={canvas.id}
        />
      ))}
    </div>
  );
});
