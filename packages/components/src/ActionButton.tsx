import { Button, ButtonProps } from "react-aria-components";
import { cn } from "./utils";

export function ActionButton({
  className,
  primary,
  center,
  children,
  ...props
}: { primary?: boolean; center?: boolean } & ButtonProps) {
  return (
    <Button
      className={cn(
        //
        "border-none flex gap-1 items-center px-2 py-1 bg-gray-100 text-me-primary-500 text-sm rounded hover:bg-gray-200",
        primary ? "bg-me-primary-500 text-white hover:bg-me-primary-600" : "",
        center ? "place-content-center" : "",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
