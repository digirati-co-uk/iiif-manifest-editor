import { ReactNode } from "react";
import * as $ from "./CenterPanelContainer.styles";
import { CenterPanelClose, CenterPanelHeader } from "./CenterPanelContainer.styles";
import { CloseIcon } from "@/icons/CloseIcon";
import { Button } from "@/atoms/Button";

interface CenterPanelContainerProps {
  close?: () => void;
  title?: string;
  children: ReactNode;
}

export function CenterPanelContainer(props: CenterPanelContainerProps) {
  return (
    <div className={$.CenterPanelContainer}>
      {props.title || props.close ? (
        <div className={$.CenterPanelHeader}>
          {props.title ? <h2 className={$.CenterPanelTitle}>{props.title}</h2> : null}
          {props.close ? (
            <Button className={$.CenterPanelClose} onClick={props.close}>
              <CloseIcon />
            </Button>
          ) : null}
        </div>
      ) : null}
      {props.children}
    </div>
  );
}
