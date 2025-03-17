import { forwardRef } from "react";

export const HandleContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function HandleContainer({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`relative text-2xl flex p-0.5 rounded-sm aspect-square hover:bg-me-primary-100 aria-expanded:bg-me-primary-500 aria-expanded:text-white ${className || ""}`}
      {...props}
    />
  );
});
