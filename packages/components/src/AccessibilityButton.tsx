import { Button, ButtonProps } from "react-aria-components";

export function AccessibilityButton({ className, children, ...props }: ButtonProps & { className?: string }) {
  return (
    <Button className={["sr-only focus:not-sr-only p-2 bg-white text-black", className].join(" ")} {...props}>
      {children}
    </Button>
  );
}
