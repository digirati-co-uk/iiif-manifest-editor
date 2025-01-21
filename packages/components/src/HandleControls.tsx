import { CloseIcon } from "./icons/CloseIcon";
import { forwardRef } from "react";
import { ResetIcon } from "./icons/ResetIcon";
import { DownIcon } from "./icons/DownIcon";
import { TransitionStatus } from "react-transition-group";
import { cn } from "./utils";

export const HandleControls = forwardRef<
  HTMLDivElement,
  {
    dir: "left" | "right";
    open: boolean;
    actions: {
      open: () => void;
      close: () => void;
    };
    transition?: TransitionStatus;

    reset?: () => void;
  }
>(function HandleControls({ dir, open, actions, reset }, ref) {
  return (
    <div className="relative w-px bg-black/20" onClick={() => actions.open()}>
      <div
        className={cn(
          "absolute pointer-events-none w-[21px] top-0 bottom-0 z-30",
          open ? "-left-[10px]" : dir === "left" ? "left-0" : "-left-[20px]"
        )}
      >
        {!open ? (
          <button
            className={cn(
              "relative flex opacity-100 bg-white h-[55px] pointer-events-auto w-[21px] mt-[4.5em] cursor-pointer items-center justify-center",
              "drop-shadow-md transform scale-x-100",
              dir === "right" ? "rounded-l-md origin-right" : "rounded-r-md origin-left",
              "hover:bg-gray-100 hover:scale-x-125"
            )}
            onClick={(e) => {
              e.stopPropagation();
              actions.open();
            }}
          >
            <DownIcon rotate={dir === "right" ? 90 : 270} />
          </button>
        ) : null}
      </div>
      <div
        ref={ref}
        className={cn(
          "group absolute w-[21px] top-0 bottom-0 z-20 flex flex-col items-center justify-center bg-transparent",
          "transition-all duration-300 transform scale-x-70",
          open ? "-left-[10px]" : dir === "left" ? "left-0" : "-left-[20px]",
          open ? "cursor-col-resize" : "cursor-pointer",
          "hover:scale-x-100 hover:bg-black/10"
        )}
      >
        {open ? (
          <button
            className={cn(
              "group-hover:opacity-100 group-hover:scale-100 duration-300 my-[0.2em] select-none text-gray-400",
              "opacity-0 transform scale-70 focus:outline focus:outline-2 outline-me-primary-500",
              "bg-white w-[30px] h-[30px] rounded-full flex justify-center items-center",
              "drop-shadow-md cursor-default"
            )}
            onClick={(e) => {
              e.stopPropagation();
              actions.close();
            }}
          >
            <CloseIcon />
          </button>
        ) : null}
        {reset && open ? (
          <button
            className={cn(
              "group-hover:opacity-100 group-hover:scale-100 duration-300 my-[0.2em] select-none text-gray-400",
              "opacity-0 transform scale-70 focus:outline focus:outline-2 outline-me-primary-500",
              "bg-white w-[30px] h-[30px] rounded-full flex justify-center items-center",
              "drop-shadow-md cursor-default"
            )}
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
          >
            <ResetIcon />
          </button>
        ) : null}
        {open ? (
          <button
            className={cn(
              "group-hover:opacity-100 group-hover:scale-100 relative bg-white h-[40px] w-[15px] rounded-md text-gray-400",
              "drop-shadow-md select-none duration-300",
              "my-[0.2em] opacity-0 transform scale-70 focus:outline focus:outline-2 outline-me-primary-500"
            )}
          />
        ) : null}
      </div>
    </div>
  );
});
