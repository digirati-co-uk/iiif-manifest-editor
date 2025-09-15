import { usePress } from "react-aria";
import { CanvasContext } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { CanvasLabel } from "./CanvasLabel";
import { Card3D } from "./Card3D";
import { LazyThumbnail } from "./LazyThumbnail";
import { cn } from "./utils";

interface CanvasThumbnailGridItemProps {
  onClick?: () => void;
  id: string;
  selected?: boolean;
  active?: boolean;
  className?: string;
  icon?: React.ReactNode;
}
export function CanvasThumbnailGridItem(props: CanvasThumbnailGridItemProps) {
  const { pressProps } = usePress({
    onPress: props.onClick,
  });
  return (
    <CanvasContext canvas={props.id}>
      <div {...pressProps} className={twMerge("flex flex-col", props.className)} data-canvas-selected={props.selected}>
        <div className="bg-me-gray-100 relative w-full aspect-square group flex-1 overflow-hidden rounded">
          <Card3D
            data-canvas-selected={props.active}
            aria-selected={props.active}
            className={cn(
              "border-2 border-transparent  p-1 w-full h-full rounded",
              props.selected && "border-me-primary-500",
            )}
          >
            <LazyThumbnail />
          </Card3D>
          {props.icon || null}
        </div>
        <CanvasLabel className="text-sm text-center truncate mt-1" as="div" />
      </div>
    </CanvasContext>
  );
}
