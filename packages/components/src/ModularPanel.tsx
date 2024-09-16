import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { HtmlHTMLAttributes } from "react";
import type { TransitionStatus } from "react-transition-group";

export function ModularPanelWrapper(
  props: HtmlHTMLAttributes<HTMLDivElement> & {
    "data-state"?: TransitionStatus;
    "data-flipped"?: boolean;
    floating?: boolean;
    header?: boolean;
  }
) {
  const { className, floating, ...rest } = props;

  const classes = twMerge(
    clsx(
      "flex flex-col relative h-full overflow-hidden ModularPanel",
      {
        "border-t border-solid border-gray-200": !props.header,
        "m-2 rounded overflow-hidden bg-white": floating,
      },
      className
    )
  );

  return <div className={classes} {...rest} />;
}
