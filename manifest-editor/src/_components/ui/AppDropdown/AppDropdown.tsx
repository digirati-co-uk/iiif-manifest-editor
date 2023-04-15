import { PauseIcon, PlayIcon } from "@/_panels/center-panels/CanvasPanelViewer/components/MediaControls.icons";
import { appDropdownStyles as $ } from "./AppDropdown.styles";
import cx from "classnames";
import { CropIcon } from "@/icons/CropIcon";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { Button } from "@/atoms/Button";
import { createPortal } from "react-dom";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

interface AppDropdownProps {
  items: Array<{
    label: string;
    isRunning?: boolean;
    hotkey?: string;
    icon?: any;
    actionLink?: () => void;
    actionLinkLabel?: string;
    action?: () => void;
    onClick?: () => void;
    sectionAbove?: { label: string; divider?: boolean };
  }>;
}

export function AppDropdownPortalElement() {
  return <div id="app-dropdown-portal" />;
}

function Portal({ children }: { children: any }) {
  const mount = document.getElementById("app-dropdown-portal");
  const el = document.createElement("div");

  useEffect(() => {
    mount!.appendChild(el);
    return () => mount!.removeChild(el) as any;
  }, [el, mount]);

  return createPortal(children, el);
}

export function AppDropdown({ items }: AppDropdownProps) {
  const { itemProps, buttonProps, isOpen, setIsOpen } = useDropdownMenu(items.length);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<any>({});

  const update = () => {
    const rect = buttonProps.ref.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        position: "absolute",
        top: rect?.top + rect?.height,
        left: rect?.left,
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
    <div className={$.menuOuter}>
      <Button {...buttonProps} onClick={onClick} onKeyDown={onKeyDown}>
        Open
      </Button>
      {isOpen ? (
        <Portal>
          <ul className={$.container} style={position}>
            {items.map((item, key) => {
              const listItem = (
                <li key={key} className={$.itemContainer} {...(itemProps as any)[key]} onClick={item.onClick}>
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

              return listItem;
            })}
          </ul>
        </Portal>
      ) : null}
    </div>
  );
}
