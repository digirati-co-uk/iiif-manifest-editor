import { type DetailedHTMLProps, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export const PaddedSidebarContainer = forwardRef<
  HTMLDivElement,
  DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge("px-4 py-2 flex-1 overflow-visible", className)} {...props} />
));
