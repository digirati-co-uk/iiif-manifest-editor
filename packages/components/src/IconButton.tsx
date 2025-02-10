import { twMerge } from "tailwind-merge";
import { DefaultTooltipContent, Tooltip, TooltipTrigger } from "./Tooltip";

export function IconButton({
  children,
  active,
  label,
  disabled,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Tooltip placement="top">
      <TooltipTrigger
        onClick={onPress}
        className={twMerge(
          "rounded flex items-center bg-white justify-center p-2 hover:bg-gray-100 text-2xl",
          active
            ? "bg-me-primary-500 bg-opacity-40 hover:bg-opacity-70 hover:bg-me-primary-500"
            : "",
          disabled ? "opacity-50 pointer-events-none" : "",
        )}
      >
        {children}
        <DefaultTooltipContent className="translate-x-3">
          {label}
        </DefaultTooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
}
