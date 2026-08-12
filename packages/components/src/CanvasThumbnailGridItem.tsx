import { getValue } from "@iiif/helpers";
import { useRef } from "react";
import { useDrag, useDraggableItem, usePress } from "react-aria";
import { CanvasContext, useCanvas } from "react-iiif-vault";
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
  hideLabel?: boolean;
  containerProps?: any;
  dragState?: any;
  customLabel?: (opts: { className: string }) => React.ReactNode;
}
export function CanvasThumbnailGridItem(props: CanvasThumbnailGridItemProps) {
  const canvas = useCanvas({ id: props.id });
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
  const Component = props.onClick ? "button" : "div";
  const isCurrent = props.selected || props.active;

  return (
    <CanvasContext canvas={props.id}>
      <Component
        {...(props.onClick ? { type: "button" as const } : {})}
        {...(props.dragState ? dragProps : {})}
        onClick={props.onClick}
        className={twMerge(
          "flex flex-col border-0 bg-transparent p-0 text-inherit",
          props.className,
        )}
        data-canvas-selected={props.selected}
        aria-current={isCurrent ? "true" : undefined}
        aria-label={props.onClick ? getValue(canvas?.label as any) || "Untitled canvas" : undefined}
        {...(props.containerProps || {})}
      >
        <div className="bg-me-gray-100 relative w-full aspect-square group flex-1 overflow-hidden rounded">
          <Card3D
            data-canvas-selected={props.active}
            className={cn(
              "border-2 border-transparent  p-1 w-full h-full rounded select-none",
              props.selected && "border-me-primary-500",
            )}
          >
            <LazyThumbnail />
          </Card3D>
          {props.icon || null}
        </div>
        {props.hideLabel ? null : props.customLabel ? (
          props.customLabel({ className: "text-sm text-center truncate mt-1" })
        ) : (
          <CanvasLabel className="text-sm text-center truncate mt-1" as="div" />
        )}
      </Component>
    </CanvasContext>
  );
}
