import type React from "react";
import { twMerge } from "tailwind-merge";

interface WarningMessageProps {
  children: React.ReactNode;
  small?: boolean;
  className?: string;
}

export function WarningMessage({ children, small = false, className }: WarningMessageProps) {
  return (
    <div
      className={twMerge(
        "bg-orange-500 text-white",
        "border-1 drop-shadow border-orange-700 w-full rounded-md py-2 px-4 leading-[1.9em] flex items-center",
        "has-[a]:text-white",
        small && "text-xs whitespace-nowrap py-1 px-2 leading-[1.6em] w-fit",
        className,
      )}
    >
      {children}
    </div>
  );
}
