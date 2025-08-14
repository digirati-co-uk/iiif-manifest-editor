import { Button, type ButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function ActionButton({
  className,
  primary,
  center,
  large,
  children,
  ...props
}: { primary?: boolean; center?: boolean; large?: boolean } & ButtonProps) {
  return (
    <Button
      className={(t) =>
        twMerge(
          //
          "border-none flex gap-1 items-center bg-gray-100 flex-nowrap whitespace-nowrap text-me-primary-500 text-sm rounded hover:bg-gray-200",
          primary ? "bg-me-primary-500 text-white hover:bg-me-primary-600" : "",
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
