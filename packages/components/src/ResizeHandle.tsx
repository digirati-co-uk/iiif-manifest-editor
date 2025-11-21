import { forwardRef } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export const ResizeHandle = forwardRef(function ResizeHandle(
  { className, ...props }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  return (
    <Button
      className={twMerge(
        "transition-all mt-2 mb-2 opacity-0 transform scale-y-70 focus:ring focus:ring-me-500",
        "bg-white h-10 w-3 rounded shadow select-none group-hover:opacity-100",
        className as any,
      )}
      {...props}
      ref={ref}
    />
  );
});
