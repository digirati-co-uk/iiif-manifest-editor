import { twMerge } from "tailwind-merge";
import { DefaultTooltipContent, Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full flex flex-col overflow-hidden">{children}</div>;
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge("flex-1 min-h-0 overflow-y-auto", className)}>{children}</div>;
}

interface SidebarHeaderProps {
  actions?: Array<{
    icon: any;
    onClick: () => void;
    disabled?: boolean;
    toggled?: boolean;
    title: string;
  }>;
  title: string;
}

export function SidebarHeader(props: SidebarHeaderProps) {
  const { actions, title } = props;

  return (
    <div className="bg-me-gray-100 h-12 flex items-center px-3 z-10 text-black border-b-me-gray-300 border-b">
      <div className="flex-1">{title}</div>
      <div className="ml-auto flex gap-2 items-center">
        {actions?.map((action, index) => (
          <Tooltip placement="bottom" key={index}>
            <TooltipTrigger asChild>
              <button
                key={index}
                className={`p-1 rounded hover:bg-me-gray-300 ${action.toggled ? "bg-me-gray-300" : ""}`}
                onClick={action.onClick}
                title={action.title}
                disabled={action.disabled}
              >
                {action.icon}
              </button>
            </TooltipTrigger>
            <DefaultTooltipContent>{action.title}</DefaultTooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
