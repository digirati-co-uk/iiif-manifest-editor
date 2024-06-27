import { cn } from "./utils";

export function ControlButton({
  children,
  className,
  ...props
}: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "bg-white border border-me-primary-500 text-xs py-1 px-2 rounded text-me-primary-600 hover:bg-me-primary-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
