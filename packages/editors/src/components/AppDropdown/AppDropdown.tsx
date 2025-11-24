import {
  autoUpdate,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PauseIcon } from "@manifest-editor/ui/icons/PauseIcon";
import { PlayIcon } from "@manifest-editor/ui/icons/PlayIcon";
import cx from "classnames";
import { type CSSProperties, Fragment, useLayoutEffect } from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";

export interface AppDropdownItem {
  label: string;
  isRunning?: boolean;
  hotkey?: string;
  icon?: any;
  actionLink?: () => void;
  actionLinkLabel?: string;
  action?: () => void;
  active?: boolean;
  onClick?: () => void;
  sectionAbove?: { label: string; divider?: boolean };
}

interface AppDropdownProps {
  as?: any;
  items: AppDropdownItem[];
  "aria-label"?: string;
  children: any;
  style?: CSSProperties;
  className?: string;
}

export function AppDropdown({ as, items, children, "aria-label": ariaLabel, style, ...props }: AppDropdownProps) {
  const Comp: any = as || Button;

  const { itemProps, buttonProps, isOpen, setIsOpen } = useDropdownMenu(items.length);

  const { x, y, refs, strategy, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip({
        fallbackPlacements: ["bottom-end", "top-end"],
      }),
      shift({ padding: 10 }),
    ],
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const update = () => {
    const rect = buttonProps.ref.current?.getBoundingClientRect();
    if (rect) {
      refs.setPositionReference({
        getBoundingClientRect() {
          return rect;
        },
      });
    }
  };

  const onClick = (e: any) => {
    update();
    if (buttonProps.onClick) {
      buttonProps.onClick(e);
    }
  };
  const onKeyDown = (e: any) => {
    update();
    if (buttonProps.onKeyDown) {
      buttonProps.onKeyDown(e);
    }
  };

  useLayoutEffect(() => {
    update();
  }, []);

  return (
    <div className="relative" style={style}>
      <Comp {...buttonProps} {...props} aria-label={ariaLabel} onClick={onClick} onKeyDown={onKeyDown}>
        {children}
      </Comp>
      {isOpen && (
        <FloatingPortal>
          <FloatingOverlay lockScroll style={{ zIndex: 60 }}>
            <FloatingFocusManager context={context} initialFocus={refs.floating}>
              <ul
                className="absolute bg-white border border-gray-300 shadow-lg rounded-md p-1 list-none m-0 min-w-0"
                ref={refs.setFloating}
                style={{
                  position: strategy,
                  left: x ?? 0,
                  top: y ?? 0,
                }}
              >
                {items.map((item, key) => {
                  const listItem = (
                    <li
                      key={key}
                      className={cx(
                        "bg-white rounded-sm flex text-sm",
                        item.active && "font-semibold shadow-[0_0_0_2px_#bfd1ed]",
                      )}
                      {...(itemProps as any)[key]}
                      onClick={item.onClick}
                    >
                      {item.onClick ? (
                        <button className="border-none outline-none bg-transparent m-0 p-0 text-inherit cursor-pointer hover:text-inherit flex-1 text-left p-1.5 rounded-sm flex hover:bg-blue-50 focus:bg-blue-50 focus:outline-2 focus:outline-[#bfd1ed]">
                          {item.icon ? (
                            <span className="flex items-center px-1 text-xl">
                              <span className="w-3.5">{item.icon}</span>
                            </span>
                          ) : null}
                          <span className="flex-1 px-1 pr-4">{item.label}</span>
                          {item.hotkey ? <span className="font-light text-sm text-gray-500">{item.hotkey}</span> : null}
                        </button>
                      ) : (
                        <div className="flex-1 text-left h-9.5 flex items-center">
                          <button className="border-none outline-none bg-transparent m-0 p-0 text-inherit cursor-pointer hover:text-inherit flex items-center py-2.5 px-2.5 rounded-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-2 focus:outline-[#bfd1ed]">
                            <span className="w-3">
                              {item.icon || (item.isRunning ? <PauseIcon /> : <PlayIcon title="" />)}
                            </span>
                          </button>
                          <span
                            className={cx("flex-1 px-1 pr-4", item.isRunning && "text-gray-500")}
                            data-running={item.isRunning}
                          >
                            {item.label}
                          </span>
                          {item.actionLink ? (
                            <button className="border-none outline-none bg-transparent m-0 p-0 text-inherit cursor-pointer hover:text-inherit text-blue-500 underline px-2 focus:outline-2 focus:outline-[#bfd1ed]">
                              {item.actionLinkLabel || "view"}
                            </button>
                          ) : null}
                          {item.hotkey ? <span className="font-light text-sm text-gray-500">{item.hotkey}</span> : null}
                        </div>
                      )}
                    </li>
                  );

                  if (item.sectionAbove) {
                    return (
                      <Fragment key={key}>
                        {item.sectionAbove.divider ? (
                          <hr className="mt-1 mb-1 -ml-1 -mr-1 h-px bg-gray-300 border-none" />
                        ) : null}
                        <li className="text-xs text-gray-500 font-medium py-1 px-1">{item.sectionAbove.label}</li>
                        {listItem}
                      </Fragment>
                    );
                  }

                  return listItem;
                })}
              </ul>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </div>
  );
}
