import type { Placement } from "@floating-ui/react-dom";
import { twMerge } from "tailwind-merge";
import { DefaultTooltipContent, Tooltip, TooltipTrigger } from "./Tooltip";

export function IconButton({
  children,
  active,
  label,
  disabled,
  onPress,
  root,
  className,
  placement = "top",
}: {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  label: string;
  placement?: Placement;
  root?: HTMLElement;
}) {
  return (
    <Tooltip placement={placement}>
      <TooltipTrigger
        onClick={onPress}
        className={twMerge(
          "rounded flex items-center bg-white justify-center p-2 hover:bg-gray-100 text-2xl",
          active ? "bg-me-primary-500 bg-opacity-40 hover:bg-opacity-70 hover:bg-me-primary-500" : "",
          disabled ? "opacity-50 pointer-events-none" : "",
          className,
        )}
      >
        {children}
        <DefaultTooltipContent root={root} className="translate-x-3 z-50">
          {label}
        </DefaultTooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
}
