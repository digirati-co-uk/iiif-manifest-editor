import { CanvasContext, LocaleString, useCanvas } from "react-iiif-vault";
import { LazyThumbnail } from "./LazyThumbnail";
import { CanvasLabel } from "./CanvasLabel";
import { cn } from "./utils";
import { Card3D } from "./Card3D";

interface CanvasThumbnailGridItemProps {
  onClick?: () => void;
  id: string;
  selected?: boolean;
  active?: boolean;
}

export function CanvasThumbnailGridItem(props: CanvasThumbnailGridItemProps) {
  const canvas = useCanvas();

  if (canvas) {
    return (
      <CanvasContext canvas={canvas.id}>
        <div onMouseDown={props.onClick} className="flex flex-col" data-canvas-selected={props.selected}>
          <div className="bg-me-gray-100 w-full aspect-square flex-1 overflow-hidden rounded">
            <Card3D
              data-canvas-selected={props.active}
              aria-selected={props.active}
              className={cn(
                "border-2 border-transparent  p-1 w-full h-full rounded",
                props.selected && "border-me-primary-500"
              )}
            >
              <LazyThumbnail />
            </Card3D>
          </div>
          <CanvasLabel className="text-sm text-center truncate mt-1" as="div" />
        </div>
      </CanvasContext>
    );
  }
}
