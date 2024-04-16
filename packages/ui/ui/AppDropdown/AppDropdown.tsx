// import $ from "./AppDropdown.module.css";
import cx from "classnames";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { createPortal } from "react-dom";
import { CSSProperties, Fragment, useEffect, useLayoutEffect } from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
} from "@floating-ui/react";

const $ = {} as any;

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
  children: any;
  style?: CSSProperties;
}

export function AppDropdown({ as, items, children, style, ...props }: AppDropdownProps) {
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
    <div className={$.menuOuter} style={style}>
      <Comp {...buttonProps} {...props} onClick={onClick} onKeyDown={onKeyDown}>
        {children}
      </Comp>
      {isOpen && (
        <FloatingPortal>
          <FloatingOverlay lockScroll style={{ zIndex: 60 }}>
            <FloatingFocusManager context={context} initialFocus={refs.floating}>
              <ul
                className={$.container}
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
                      className={cx($.itemContainer, item.active && $.itemContainerActive)}
                      {...(itemProps as any)[key]}
                      onClick={item.onClick}
                    >
                      {item.onClick ? (
                        <button className={cx($.actionButton, $.buttonReset)}>
                          {item.icon ? <span className={$.itemIcon}>{item.icon}</span> : null}
                          <span className={$.itemLabel}>{item.label}</span>
                          {item.hotkey ? <span className={$.itemHotkey}>{item.hotkey}</span> : null}
                        </button>
                      ) : (
                        <div className={$.splitItem}>
                          <button onClick={item.action} className={cx($.buttonReset, $.iconAction)}>
                            {item.icon || (item.isRunning ? <PauseIcon /> : <PlayIcon title="" />)}
                          </button>
                          <span className={$.itemLabel} data-running={item.isRunning}>
                            {item.label}
                          </span>
                          {item.actionLink ? (
                            <button onClick={item.actionLink} className={cx($.buttonReset, $.itemLink)}>
                              {item.actionLinkLabel || "view"}
                            </button>
                          ) : null}
                          {item.hotkey ? <span className={$.itemHotkey}>{item.hotkey}</span> : null}
                        </div>
                      )}
                    </li>
                  );

                  if (item.sectionAbove) {
                    return (
                      <Fragment key={key}>
                        {item.sectionAbove.divider ? <hr className={$.divider} /> : null}
                        <li className={$.sectionLabel}>{item.sectionAbove.label}</li>
                        {listItem}
                      </Fragment>
                    );
                  }

                  return <Fragment key={key}>{listItem}</Fragment>;
                })}
              </ul>
            </FloatingFocusManager>
          </FloatingOverlay>
        </FloatingPortal>
      )}
    </div>
  );
}
