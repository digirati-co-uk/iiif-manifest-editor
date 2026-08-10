import { Button, type ButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function ActionButton({
  className,
  primary,
  center,
  large,
  onDark,
  children,
  ...props
}: { primary?: boolean; onDark?: boolean; center?: boolean; large?: boolean } & ButtonProps) {
  return (
    <Button
      className={(t) =>
        twMerge(
          //
          "border-none flex gap-1 items-center bg-me-50 flex-nowrap whitespace-nowrap text-me-700 text-sm rounded hover:bg-me-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-me-primary-500 focus-visible:ring-offset-2",
          primary && !onDark ? "bg-me-primary-500 text-white hover:bg-me-primary-600" : "",
          primary && onDark ? "bg-me-700 text-white hover:bg-me-800" : "",
          center ? "place-content-center" : "",
          large ? "px-4 py-2" : "px-2 py-1",
          t.isDisabled ? "opacity-70 cursor-not-allowed pointer-events-none" : "",
          typeof className === "string" ? className : className?.(t),
        )
      }
      {...props}
    >
      {children}
    </Button>
  );
}
