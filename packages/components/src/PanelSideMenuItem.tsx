import { twMerge } from "tailwind-merge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

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
        <button
          className={twMerge(
            "aspect-square w-full flex justify-center items-center hover:bg-me-primary-100 hover:text-black [&>svg]:text-2xl cursor-default",
            props.selected
              ? "bg-me-primary-500 hover:bg-me-primary-600 hover:text-white text-white"
              : "text-me-gray-700"
          )}
          onMouseDown={props.onClick}
        >
          {props.icon}
          <TooltipContent className="bg-me-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-90 z-50">
            {props.label}
          </TooltipContent>
        </button>
      </TooltipTrigger>
    </Tooltip>
  );
}
