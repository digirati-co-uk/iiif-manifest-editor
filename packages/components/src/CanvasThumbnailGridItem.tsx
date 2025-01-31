import { CanvasContext, LocaleString } from "react-iiif-vault";
import { LazyThumbnail } from "./LazyThumbnail";
import { CanvasLabel } from "./CanvasLabel";
import { cn } from "./utils";
import { Card3D } from "./Card3D";

export function CanvasThumbnailGridItem(props: { id: string; selected?: boolean; onClick?: () => void }) {
  return (
    <CanvasContext canvas={props.id}>
      <div onMouseDown={props.onClick} className="flex flex-col" data-canvas-selected={props.selected}>
        <div className="bg-me-gray-100 w-full aspect-square flex-1 overflow-hidden rounded">
          <Card3D
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
