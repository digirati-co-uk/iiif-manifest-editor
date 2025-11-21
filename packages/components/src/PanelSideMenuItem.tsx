import { Button } from "react-aria-components";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { cn } from "./utils";

interface PanelSideMenuItemProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function PanelSideMenuItem(props: PanelSideMenuItemProps) {
  return (
    <Tooltip placement="right">
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "border-none aspect-square w-full flex justify-center items-center hover:bg-me-primary-100 hover:text-black [&>svg]:text-2xl cursor-default",
            props.selected
              ? "bg-me-primary-500 hover:bg-me-primary-600 hover:text-white text-white"
              : "text-me-gray-700",
          )}
          aria-label={props.label}
          onMouseDown={props.onClick}
        >
          {props.icon}
          <TooltipContent className="bg-me-gray-900 text-white text-sm px-3 py-2 rounded opacity-90 z-50">
            {props.label}
          </TooltipContent>
        </Button>
      </TooltipTrigger>
    </Tooltip>
  );
}
