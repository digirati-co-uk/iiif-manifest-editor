import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import React, { type ReactElement, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  InnerModalContainer,
  ModalBackground,
  ModalBody,
  ModalCloseIcon,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  ModalHeaderTitle,
  ModalResizeIcon,
} from "./Modal";

export { ModalCloseIcon } from "./Modal";

const ModalAction = styled.button`
  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
`;

export const ModalButton: React.FC<{
  ref?: any;
  title: string;
  button?: boolean;
  as?: any;
  onClose?: () => void;
  onOpen?: () => void;
  render: (opts: { close: () => void }) => ReactElement | null;
  renderFooter?: (opts: { close: () => void }) => ReactElement;
  className?: string;
  autoHeight?: boolean;
  footerAlignRight?: boolean;
  modalSize?: "lg" | "md" | "sm";
  disabled?: boolean;
  openByDefault?: boolean;
  style?: any;

  onKeyDown?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
  role?: string;
  $disabled?: boolean;
  children?: ReactNode;
}> = React.forwardRef(function ModalButton(
  {
    as,
    className,
    disabled,
    button,
    title,
    render,
    renderFooter,
    onClose,
    onOpen,
    modalSize,
    autoHeight,
    footerAlignRight,
    children,
    openByDefault = false,
    style,
    onKeyDown,
    tabIndex,
    role,
  },
  ref
) {
  const t = useTranslations("ui");
  const { locale, direction } = useEditorI18n();
  const portalEl = useRef<HTMLElement | undefined>(undefined);
  const [ready, setIsReady] = useState(openByDefault);
  const [expanded, setIsExpanded] = useState(false);
  const containerRef = useRef<any>(null);

  useLayoutEffect(() => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    portalEl.current = element;

    return () => {
      portalEl.current = undefined;
      document.body.removeChild(element);
    };
  }, []);

  const closeModal = () => {
    setIsReady(false);
    setIsExpanded(false);
    if (onClose) {
      onClose();
    }
  };

  const Component = as ? as : button ? "button" : "span";

  return (
    <>
      {ready && portalEl.current
        ? createPortal(
            <>
              <ModalBackground />
              <ModalContainer
                lang={locale}
                dir={direction}
                ref={containerRef}
                onClick={(e) => {
                  if (e.target !== containerRef.current) {
                    return;
                  }
                  closeModal();
                }}
              >
                <InnerModalContainer $expanded={expanded} size={modalSize} data-cy="modal">
                  <ModalHeader>
                    <ModalHeaderTitle>{title}</ModalHeaderTitle>
                    <ModalAction
                      type="button"
                      aria-label={t(expanded ? "modal.shrink" : "modal.expand")}
                      onClick={() => setIsExpanded((e) => !e)}
                    >
                      <ModalResizeIcon aria-hidden="true" />
                    </ModalAction>
                    <ModalAction type="button" aria-label={t("actions.close")} onClick={closeModal}>
                      <ModalCloseIcon aria-hidden="true" />
                    </ModalAction>
                  </ModalHeader>
                  <ModalBody>{render({ close: closeModal })}</ModalBody>
                  {renderFooter ? (
                    <ModalFooter $footerAlignRight={footerAlignRight}>
                      {renderFooter({ close: closeModal })}
                    </ModalFooter>
                  ) : null}
                </InnerModalContainer>
              </ModalContainer>
            </>,
            portalEl.current
          )
        : null}
      <Component
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        ref={ref}
        className={className}
        disabled={disabled}
        onClick={() => {
          setIsReady(true);
          if (onOpen) {
            onOpen();
          }
        }}
        style={style}
      >
        {children}
      </Component>
    </>
  );
});
