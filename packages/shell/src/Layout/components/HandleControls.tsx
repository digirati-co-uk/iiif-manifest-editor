import { DefaultTooltipContent, Tooltip, TooltipTrigger } from "@manifest-editor/components";
import { ButtonReset } from "@manifest-editor/ui/atoms/Button";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { ResetIcon } from "@manifest-editor/ui/icons/ResetIcon";
import { forwardRef } from "react";
import type { TransitionStatus } from "react-transition-group";
import styled, { css } from "styled-components";
import type { PanelActions } from "../Layout.types";

export const HandleContainer = styled.div`
  position: relative;
  width: 1px;
  background: rgba(0, 0, 0, 0.2);
  z-index: 50;
`;

const HandleControl = styled(ButtonReset)`
  transition:
    opacity 300ms,
    transform 300ms;
  margin-block-start: 0.2em;
  margin-block-end: 0.2em;
  user-select: none;
  opacity: 0;
  transform: scaleY(70%);
  &:focus {
    outline: 2px solid salmon;
  }
`;

const ResizeHandle = styled(HandleControl)`
  position: relative;
  background: #fff;
  height: 40px;
  width: 15px;
  border-radius: 3px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  user-select: none;
`;

const IconControl = styled(HandleControl)`
  background: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  cursor: default;

  svg {
    fill: #9999;
  }
`;

const OpenControl = styled(HandleControl)<{ $dir: "left" | "right" }>`
  position: relative;
  display: flex;
  opacity: 1;
  background: #fff;
  height: 55px;
  pointer-events: visible;
  width: 21px;
  margin-bottom: auto;
  margin-top: 4.5em;
  cursor: pointer;
  border-radius: ${(props) => (props.$dir === "right" ? "5px 0 0 5px" : "0 5px 5px 0")};

  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.2);
  transform: scaleX(100%);
  transform-origin: ${(props) => (props.$dir === "right" ? "right" : "left")};

  &:hover {
    background: #f9f9f9;
    transform: scaleX(125%);
  }

  svg {
    font-size: 1.5em;
  }
`;

const InnerHandleContainer = styled.div<{ $open: boolean; $dir: "left" | "right" }>`
  background: rgba(0, 0, 0, 0);
  position: absolute;
  width: 16px;
  left: ${(props) => (props.$dir === "left" ? 0 : "-16px")};
  top: 0;
  bottom: 0;
  z-index: 50; // This will always be quite high.
  transition:
    background-color 300ms,
    transform 300ms;
  transform: scaleX(70%);

  cursor: ${(props) => (props.$open ? "col-resize" : "pointer")};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scaleX(100%);
    background: rgba(0, 0, 0, 0.1);
    ${HandleControl} {
      transform: scaleX(100%);
      opacity: 1;
    }
  }
`;

const UnscaledContainer = styled.div<{ $open: boolean; $dir: "left" | "right" }>`
  background: rgba(0, 0, 0, 0);
  position: absolute;
  pointer-events: none;
  width: 16px;
  left: ${(props) => (props.$dir === "left" ? 0 : "-16px")};
  top: 0;
  bottom: 0;
  z-index: 51; // This will always be quite high.
`;

export const HandleControls = forwardRef<
  HTMLDivElement,
  {
    dir: "left" | "right";
    open: boolean;
    actions: PanelActions;
    transition?: TransitionStatus;
    reset?: () => void;
  }
>(function HandleControls({ dir, open, actions, reset }, ref) {
  return (
    <HandleContainer onClick={() => actions.open()}>
      <UnscaledContainer $open={open} $dir={dir}>
        {!open ? (
          <Tooltip placement={dir === "left" ? "right" : "left"}>
            <TooltipTrigger asChild>
              <OpenControl
                $dir={dir}
                onClick={(e) => {
                  e.stopPropagation();
                  actions.open();
                }}
              >
                <DownIcon rotate={dir === "right" ? 90 : 270} />
              </OpenControl>
              <DefaultTooltipContent>Open</DefaultTooltipContent>
            </TooltipTrigger>
          </Tooltip>
        ) : null}
      </UnscaledContainer>
      <InnerHandleContainer ref={ref} $open={open} $dir={dir}>
        {open ? null : (
          <Tooltip placement={dir === "left" ? "right" : "left"}>
            <TooltipTrigger asChild>
              <IconControl
                onClick={(e) => {
                  e.stopPropagation();
                  actions.close();
                }}
              >
                <CloseIcon />
              </IconControl>
              <DefaultTooltipContent>Close</DefaultTooltipContent>
            </TooltipTrigger>
          </Tooltip>
        )}
        {reset && open ? (
          <Tooltip placement={dir === "left" ? "right" : "left"}>
            <TooltipTrigger asChild>
              <IconControl
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
              >
                <ResetIcon />
              </IconControl>
            </TooltipTrigger>
            <DefaultTooltipContent>Reset</DefaultTooltipContent>
          </Tooltip>
        ) : null}
        {open ? (
          <Tooltip placement={dir === "left" ? "right" : "left"}>
            <TooltipTrigger asChild>
              <ResizeHandle aria-label="Resize panel" />
            </TooltipTrigger>
            <DefaultTooltipContent>Resize panel</DefaultTooltipContent>
          </Tooltip>
        ) : null}
      </InnerHandleContainer>
    </HandleContainer>
  );
});
