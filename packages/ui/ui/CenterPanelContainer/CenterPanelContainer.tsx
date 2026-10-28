import { useTranslations } from "@manifest-editor/i18n";
import { ReactNode } from "react";
import $ from "./CenterPanelContainer.module.css";
import { Button } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";

interface CenterPanelContainerProps {
  close?: () => void;
  title?: string;
  children: ReactNode;
}

export function CenterPanelContainer(props: CenterPanelContainerProps) {
  const t = useTranslations("ui");
  return (
    <div className={$.CenterPanelContainer}>
      {props.title || props.close ? (
        <div className={$.CenterPanelHeader}>
          {props.title ? <h2 className={$.CenterPanelTitle}>{props.title}</h2> : null}
          {props.close ? (
            <Button aria-label={t("actions.close")} className={$.CenterPanelClose} onClick={props.close}>
              <CloseIcon />
            </Button>
          ) : null}
        </div>
      ) : null}
      {props.children}
    </div>
  );
}
