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

export function ModularPanelHeader(
  props: React.ButtonHTMLAttributes<HTMLDivElement> & { $tabs?: boolean; $error?: boolean; className?: string }
) {
  const { $tabs, $error, className, ...rest } = props;

  const classes = twMerge(
    clsx(
      "bg-white flex h-11 items-center z-2",
      {
        "shadow-[inset_0_1px_0_0_rgba(0,0,0,0.17)]": $tabs,
        "shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.17),inset_0_1px_0_0_rgba(0,0,0,0.17)]": !$tabs,
        "text-[#b61717] bg-[#ffc2d2] shadow-[inset_0_-5px_10px_0_rgba(255,255,255,0.5)]": $error,
      },
      className
    )
  );

  return <div className={classes} {...rest} />;
}

export function ModularPanelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;

  const classes = twMerge(clsx("border-none bg-transparent px-1 py-0.75 m-0.75 rounded hover:bg-gray-200", className));

  return <button className={classes} {...rest} />;
}

export function ModulePanelSpacer(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;

  const classes = twMerge(clsx("flex-1", className));

  return <div className={classes} {...rest} />;
}

export function ModularPanelLabel(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props;

  const classes = twMerge(clsx("text-sm flex-1 pl-4 text-center self-center", className));

  return <h2 className={classes} {...rest} />;
}

export function ModularPanelContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;

  const classes = twMerge(clsx("flex-1 flex min-h-0 overflow-y-auto overflow-x-hidden", className));

  return <div className={classes} {...rest} />;
}
