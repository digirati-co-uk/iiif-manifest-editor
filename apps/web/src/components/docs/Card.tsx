import cx from "classnames";

export function Card({
  children,
  className,
  shadow = false,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border",
        dark ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900",
        shadow && `shadow-lg ${dark ? "shadow-gray-900" : "shadow-gray-100 dark:shadow-gray-900"}`,
        className
      )}
    >
      {children}
    </div>
  );
}
