import type { InternationalString } from "@iiif/presentation-3";
import { Button, MenuTrigger, Popover } from "react-aria-components";
import { LocaleString } from "react-iiif-vault";
import { DefaultTooltipContent, Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { cn } from "./utils";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>;
}

export function SidebarContent({
  children,
  className,
  padding,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-y-auto pb-64", className, padding && "px-3 pt-3")}>{children}</div>
  );
}

interface SidebarHeaderProps {
  actions?: Array<{
    icon: any;
    onClick?: () => void;
    disabled?: boolean;
    toggled?: boolean;
    title: string;
    menu?: React.ReactNode;
  }>;
  title: string | InternationalString;
  customActions?: React.ReactNode;
}

export function SidebarHeader(props: SidebarHeaderProps) {
  const { actions, title, customActions } = props;

  return (
    <div className="bg-me-gray-100 h-12 flex items-center px-3 z-10 text-black border-b-me-gray-300 border-b flex-shrink-0">
      <LocaleString className="flex-1">{title}</LocaleString>
      <div className="ml-auto flex gap-2 items-center">
        {actions?.map((action, index) => {
          if (action.menu) {
            return (
              <MenuTrigger key={index}>
                <Button
                  key={index}
                  className={cn(
                    //
                    `p-1 rounded hover:bg-me-gray-300`,
                    action.toggled && "bg-me-gray-300",
                    action.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label={typeof action.title === "string" ? action.title : ""}
                  isDisabled={action.disabled}
                >
                  {action.icon}
                </Button>
                <Popover placement="bottom right">{action.menu}</Popover>
              </MenuTrigger>
            );
          }

          return (
            <Tooltip placement="bottom" key={index}>
              <TooltipTrigger asChild>
                <Button
                  key={index}
                  className={cn(
                    //
                    `p-1 rounded hover:bg-me-gray-300`,
                    action.toggled && "bg-me-gray-300",
                    action.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onPress={action.onClick}
                  aria-label={typeof action.title === "string" ? action.title : ""}
                  isDisabled={action.disabled}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              {!action.disabled ? <DefaultTooltipContent>{action.title}</DefaultTooltipContent> : null}
            </Tooltip>
          );
        })}
        {customActions}
      </div>
    </div>
  );
}
