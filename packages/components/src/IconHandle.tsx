import { forwardRef } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

export const IconHandle = forwardRef(function IconHandle(
  { className, ...props }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  return (
    <Button
      className={twMerge(
        "transition-all mt-1 mb-1 opacity-0 transform scale-y-70 focus:ring focus:ring-me-500",
        "bg-white h-8 w-8 flex items-center justify-center rounded-full drop-shadow select-none group-hover:opacity-100 text-gray-500",
        "hover:text-me-500 hover:bg-me-100",
        className as any,
      )}
      {...props}
      ref={ref}
    />
  );
});
