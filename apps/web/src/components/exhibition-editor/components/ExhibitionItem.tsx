import { LazyThumbnail } from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { forwardRef } from "react";
import { LocaleString, useCanvas, useRenderingStrategy } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { getClassName, getGridStats } from "../helpers";

export interface ExhibitionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isFirst: boolean;
  onClick: () => void;
  item: { id: string };
}

export const ExhibitionItem = forwardRef<HTMLDivElement, ExhibitionItemProps>(function ExhibitionItem(
  { isFirst, item, children: divChildren, ...props },
  ref
) {
  const canvas = useCanvas();
  const [strategy] = useRenderingStrategy();
  const behavior = canvas?.behavior || [];
  const currentCanvas = useInStack("Canvas");
  const className = getClassName(canvas?.behavior, isFirst);
  const { isBottom, isImage, isInfo, isLeft } = getGridStats(canvas?.behavior);

  const isSelected = currentCanvas?.resource.source?.id === canvas?.id;

  let children = null;
  if (isInfo) {
    children = (
      <div className="bg-black w-full h-full text-white max-h-40">
        <div className="p-1.5 text-[4px]">
          {strategy.type === "textual-content" ? (
            <LocaleString enableDangerouslySetInnerHTML>{strategy.items[0]?.text}</LocaleString>
          ) : null}
        </div>
      </div>
    );
  } else {
    children = (
      <div
        className={twMerge(
          "flex h-full max-h-full min-h-0",
          isLeft ? "flex-row-reverse" : isBottom ? "flex-col" : "flex-row"
        )}
      >
        <div className="flex-1 overflow-hidden relative justify-self-stretch">
          <div className="absolute inset-0 w-full h-full">
            <LazyThumbnail cover fade={false} />
          </div>
        </div>
        {isImage ? null : (
          <div
            className={`${isBottom ? "min-h-3 w-full" : "w-1/3"} flex-shrink-0 self-stretch p-2 text-white bg-black rounded`}
          >
            <div className="p-1.5 text-[4px]">
              <LocaleString className="block mb-1 text-[5px]">{canvas?.label}</LocaleString>
              <LocaleString>{canvas?.summary}</LocaleString>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={twMerge(
        className,
        "bg-me-gray-700 overflow-hidden hover:ring-2 ring-me-primary-500 relative",
        isSelected ? "ring-2 ring-me-primary-500" : ""
      )}
      {...props}
    >
      {children}
      {divChildren}
    </div>
  );
});
