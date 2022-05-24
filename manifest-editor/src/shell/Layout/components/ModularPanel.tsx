import { TransitionStatus } from "react-transition-group";
import { LayoutPanel, PanelActions, PanelState, PinnablePanelActions, PinnablePanelState } from "../Layout.types";
import styled, { css } from "styled-components";
import { StarIcon } from "../../../icons/StarIcon";
import { CloseIcon } from "../../../icons/CloseIcon";

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
  min-width: 20em;
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

const ModularPanelHeader = styled.div`
  background: #fff;
  display: flex;
  height: 2.8em;
  box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.17), inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
  z-index: 12;
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
  font-size: 1em;
  flex: 1 1 0px;
  padding-left: 0.5em;
`;

const ModularPanelContent = styled.div`
  flex: 1 1 0px;
  overflow-y: auto;
  padding-bottom: 1em;
`;

export function ModularPanel({
  panel,
  state,
  actions,
  pinActions = actions as any,
  transition,
  close,
}: ModularPanelProps) {
  if (!panel || !state.current) {
    return null;
  }

  return (
    <ModularPanelWrapper $state={transition}>
      <ModularPanelHeader>
        {panel.hideHeader ? <ModulePanelSpacer /> : <ModularPanelLabel>{panel.label}</ModularPanelLabel>}
        {panel.pinnable ? (
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
      <ModularPanelContent>{panel.render(state.state || panel.defaultState || {}, actions)}</ModularPanelContent>
    </ModularPanelWrapper>
  );
}
