import { TransitionStatus } from "react-transition-group";
import { LayoutPanel, PanelActions, PanelState, PinnablePanelActions, PinnablePanelState } from "../Layout.types";
import styled, { css } from "styled-components";
import { StarIcon } from "../../../icons/StarIcon";
import { CloseIcon } from "../../../icons/CloseIcon";
import { BackIcon } from "../../../icons/BackIcon";
import { useLayoutProvider } from "../Layout.context";
import { useAppState } from "../../AppContext/AppContext";
import { ErrorBoundary, useErrorHandler } from "react-error-boundary";
import { useContext, useEffect, useState } from "react";
import { ErrorMessage } from "../../../madoc/components/callouts/ErrorMessage";
import { Button, CalltoButton } from "../../../atoms/Button";
import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";
import { PanelError } from "./PanelError";
import { renderHelper } from "../Layout.helpers";
import { useVault, VaultProvider } from "react-iiif-vault";

interface ModularPanelProps {
  panel?: LayoutPanel;
  state: PinnablePanelState | PanelState;
  actions: PanelActions;
  pinActions?: PinnablePanelActions;
  transition?: TransitionStatus;
  close?: () => void;
}

const ModularPanelWrapper = styled.div<{ $floating?: boolean; $state?: TransitionStatus }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${(props) =>
    props.$floating &&
    css`
      margin: 10px;
      border-radius: 5px;
      overflow: hidden;
      background: #fff;
    `}

  transition: transform 300ms;
  ${(props) => {
    switch (props.$state) {
      case "entering":
        return css`
          transform: translateX(100%);
        `;
      case "entered":
        return css`
          transform: translateX(0);
        `;
      case "exiting":
        return css`
          transform: translateX(100%);
        `;
      case "unmounted":
      case "exited":
        return css`
          transform: translateX(100%);
        `;
    }
  }}
`;

const ModularPanelHeader = styled.div<{ $tabs?: boolean; $error?: boolean }>`
  background: #fff;
  display: flex;
  height: 2.8em;
  ${(props) =>
    props.$tabs
      ? css`
          box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
        `
      : css`
          box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.17), inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
        `}
  z-index: 12;

  ${(props) =>
    props.$error &&
    css`
      color: #b61717;
      background: #ffc2d2;
      box-shadow: inset 0 -5px 10px 0 rgba(255, 255, 255, 0.5);
    `}
`;

const ModulePanelButton = styled.button`
  border: none;
  background: transparent;
  padding: 0 0.4em;
  margin: 0.3em;
  border-radius: 3px;
  &:hover {
    background: #eee;
  }
  svg {
    font-size: 1.2em;
  }
`;

const ModulePanelSpacer = styled.div`
  flex: 1 1 0px;
`;

const ModularPanelLabel = styled.h2`
  font-size: 0.875em;
  flex: 1 1 0px;
  padding-left: 1em;
  text-align: center;
`;

const ModularPanelContent = styled.div`
  flex: 1 1 0px;
  padding-bottom: 1em;
  display: flex;

  min-height: 0;
  overflow-y: hidden;
  overflow-x: hidden;

  > * {
    min-width: 0;
  }
`;

export function ModularPanel({
  panel,
  state,
  actions,
  pinActions = actions as any,
  transition,
  close,
}: ModularPanelProps) {
  const vault = useContext(VaultProvider);
  const [didError, setDidError] = useState(false);
  const appState = useAppState();
  const layout = useLayoutProvider();
  const { tabs, pinnable, hideHeader } = panel?.options || {};
  const resetKeys = [appState.state.canvasId, panel?.id];

  useEffect(() => setDidError(false), resetKeys);

  if (!panel || !state.current) {
    return null;
  }

  return (
    <ModularPanelWrapper $state={transition}>
      <ModularPanelHeader $tabs={tabs} $error={didError}>
        {panel.backAction ? (
          <ModulePanelButton
            onClick={() =>
              panel && panel.backAction ? panel.backAction(state, { ...layout, current: actions }, appState) : null
            }
          >
            <BackIcon />
          </ModulePanelButton>
        ) : state.stack.length ? (
          <ModulePanelButton onClick={actions.popStack}>
            <BackIcon />
          </ModulePanelButton>
        ) : null}
        {hideHeader ? <ModulePanelSpacer /> : <ModularPanelLabel>{panel.label}</ModularPanelLabel>}
        {pinnable ? (
          (state as PinnablePanelState).pinned ? (
            <ModulePanelButton onClick={pinActions.unpin}>
              <StarIcon fill="orange" />
            </ModulePanelButton>
          ) : (
            <ModulePanelButton onClick={() => pinActions.pin({ id: panel.id, state: state.state })}>
              <StarIcon fill="#ddd" />
            </ModulePanelButton>
          )
        ) : null}
        <ModulePanelButton onClick={close || actions.close}>
          <CloseIcon />
        </ModulePanelButton>
      </ModularPanelHeader>
      <ModularPanelContent>
        <ErrorBoundary
          onResetKeysChange={() => setDidError(false)}
          onError={() => setDidError(true)}
          FallbackComponent={PanelError}
          resetKeys={resetKeys}
        >
          {renderHelper(
            panel.render(state.state || panel.defaultState || {}, { ...layout, current: actions, vault }, appState)
          )}
        </ErrorBoundary>
      </ModularPanelContent>
    </ModularPanelWrapper>
  );
}
