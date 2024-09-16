import type { TransitionStatus } from "react-transition-group";
import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

// export const OuterWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   flex: 1;
//   min-height: 0;

//   max-width: 100%;
//   min-width: 0;
//   overflow: hidden;
// `;
function OuterWrapper(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={twMerge("flex flex-col flex-1 min-h-0 max-w-full min-w-0 overflow-hidden", props.className)}
    />
  );
}

function Header(props: HTMLAttributes<HTMLElement>) {
  return <header {...props} className={twMerge("z-200", props.className)} />;
}

function Footer(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={twMerge("bg-white", props.className)} />;
}

const Main = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Main(props, ref) {
  return <div ref={ref} {...props} className={twMerge("flex flex-1 min-h-0", props.className)} />;
});

function LeftPanel(
  props: HTMLAttributes<HTMLDivElement> & { $state?: TransitionStatus; $width: string; $motion?: boolean }
) {
  const { $state, $width, $motion, ...rest } = props;
  const stateStyle = () => {
    switch ($state) {
      case "entering":
        return { maxWidth: $width };
      case "exiting":
      case "unmounted":
      case "exited":
        return { maxWidth: "0" };
      default:
        return {};
    }
  };
  return (
    <div
      {...rest}
      className={twMerge(
        "bg-white flex flex-col overflow-hidden max-w-[720px] items-end",
        $motion ? "transition-max-width duration-400" : "",
        rest.className
      )}
      style={stateStyle()}
    />
  );
}

function CenterPanel(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={twMerge(
        "flex flex-1 bg-[#e3e7f0] pt-1 min-w-[320px] min-h-0 overflow-hidden",
        "> *:min-w-0",
        props.className
      )}
    />
  );
}

function RightPanel(
  props: HTMLAttributes<HTMLDivElement> & { $state?: TransitionStatus; $width: string; $motion?: boolean }
) {
  const { $state, $width, $motion, ...rest } = props;
  const stateClasses = () => {
    switch ($state) {
      case "entering":
        return `max-w-[${$width}]`;
      case "exiting":
      case "unmounted":
      case "exited":
        return "max-w-0";
      default:
        return "";
    }
  };
  return (
    <div
      {...rest}
      className={twMerge(
        "bg-white flex flex-col overflow-hidden max-w-[720px]",
        $motion ? "transition-max-width duration-400" : "",
        stateClasses(),
        rest.className
      )}
    />
  );
}
export type MenuPositions = "left" | "right" | "bottom" | "top";
const PanelContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { $menu?: MenuPositions }>(
  function PanelContainer(props, ref) {
    const { $menu, ...rest } = props;
    const menuClasses = () => {
      switch ($menu) {
        case "top":
          return "flex-col";
        case "left":
          return "flex-row";
        case "bottom":
          return "flex-col-reverse";
        case "right":
          return "flex-row-reverse";
        default:
          return "";
      }
    };
    return (
      <div
        ref={ref}
        {...rest}
        className={twMerge(
          "flex flex-1 h-full min-w-[50px] transition-min-width duration-400 overflow-hidden",
          menuClasses(),
          rest.className
        )}
      />
    );
  }
);

function PanelSideMenu(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={twMerge("bg-white border-t border-r border-[#e3e7f0] flex flex-col w-[3em]", props.className)}
    />
  );
}

function PanelSideMenuItem(props: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={twMerge(
        "cursor-pointer aspect-square w-[3em] h-[3em] flex justify-center items-center hover:bg-[#fff6f9]",
        "[data-selected=true]:bg-[#b84c74] [data-selected=true] svg:text-white",
        "svg:text-[#999] svg:text-[1.5em]",
        props.className
      )}
    />
  );
}

function PanelMenu(
  props: HTMLAttributes<HTMLDivElement> & { $position: "bottom" | "top" | "left" | "right"; $open: boolean }
) {
  const { $position, $open, ...rest } = props;
  const positionClasses = () => {
    if (!$open && ($position === "top" || $position === "bottom")) {
      return "hidden";
    }
    return "";
  };
  return (
    <div
      {...rest}
      className={twMerge(
        "flex shadow-[0_-3px_2px_0_rgba(0,0,0,0.04),0_-1px_0_0_rgba(0,0,0,0.17)]",
        positionClasses(),
        rest.className
      )}
    />
  );
}

function PanelContent(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={twMerge("flex flex-col flex-1 min-w-0 overflow-hidden", props.className)} />;
}

export const Layout = {
  OuterWrapper,
  Header,
  Footer,
  Main,
  LeftPanel,
  CenterPanel,
  RightPanel,
  PanelContainer,
  PanelSideMenu,
  PanelSideMenuItem,
  PanelMenu,
  PanelContent,
};
