import { useEditorI18n, type MessageReference } from "@manifest-editor/i18n";
import { Button } from "react-aria-components";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { cn } from "./utils";

interface PanelSideMenuItemProps {
  icon: React.ReactNode;
  label: string;
  labelMessage?: MessageReference;
  selected: boolean;
  onClick: () => void;
}

export function PanelSideMenuItem(props: PanelSideMenuItemProps) {
  const { resolveMessage } = useEditorI18n();
  const label = resolveMessage(props.labelMessage, props.label);
  return (
    <Tooltip placement="right">
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "border-none bg-white aspect-square w-full flex justify-center items-center hover:bg-me-primary-100 hover:text-black [&>svg]:text-2xl cursor-default",
            props.selected
              ? "bg-me-primary-500 hover:bg-me-primary-600 hover:text-white text-white"
              : "text-me-gray-700"
          )}
          aria-label={label}
          onMouseDown={props.onClick}
        >
          {props.icon}
          <TooltipContent className="bg-me-gray-900 text-white text-sm px-3 py-2 rounded opacity-90 z-50">
            {label}
          </TooltipContent>
        </Button>
      </TooltipTrigger>
    </Tooltip>
  );
}
