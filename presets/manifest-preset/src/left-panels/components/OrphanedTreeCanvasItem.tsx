import { AddImageIcon } from "@manifest-editor/components";
import { useDrag } from "react-aria";
import { LocaleString, useCanvas } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";

export function OrphanedTreeCanvasItem() {
  const canvas = useCanvas();
  const { dragProps, isDragging } = useDrag({
    getItems() {
      return [
        {
          "text/plain": JSON.stringify({ item: canvas?.id }),
        },
      ];
    },
  });
  if (!canvas) return null;

  return (
    <div className="flex items-center" {...dragProps}>
      <div
        className={twMerge(
          `flex flex-1 min-w-0 truncate whitespace-nowrap items-center gap-2 flex-shrink-0 pl-4`,
          isDragging ? "cursor-grabbing opacity-50" : "cursor-pointer",
        )}
      >
        <AddImageIcon className="text-xl flex-shrink-0 text-gray-400" />
        <LocaleString defaultText={(<span className="text-gray-500">Untitled canvas</span>) as any}>
          {canvas.label}
        </LocaleString>
      </div>
    </div>
  );
}
