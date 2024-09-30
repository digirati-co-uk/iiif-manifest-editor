import { cn } from "./utils";

export function PaddedSidebarContainer({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className, "py-3 mx-3 flex-1 overflow-visible")} {...props}>
      {children}
    </div>
  );
}
