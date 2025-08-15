import { TransitionStatus } from "react-transition-group";
import { LayoutPanel, PanelActions, PanelState, PinnablePanelActions, PinnablePanelState } from "../Layout.types";
import styled, { css } from "styled-components";
import { StarIcon } from "@manifest-editor/ui/icons/StarIcon";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { BackIcon } from "@manifest-editor/ui/icons/BackIcon";
import { useLayoutProvider } from "../Layout.context";
import { ErrorBoundary } from "react-error-boundary";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PanelError } from "./PanelError";
import { renderHelper } from "../Layout.helpers";
import { ReactVaultContext } from "react-iiif-vault";
import {
  DropdownDivider,
  DropdownLabel,
  DropdownMenu,
  Dropdown,
  DropdownItem,
} from "@manifest-editor/ui/atoms/Dropdown";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useAppState } from "../../AppContext/AppContext";

const OverrideScrollbar = 'OverrideScrollbar';

interface ModularPanelProps {
  panel?: LayoutPanel;
  isLeft?: boolean;
  state: PinnablePanelState | PanelState;
  actions: PanelActions;
  pinActions?: PinnablePanelActions;
  transition?: TransitionStatus;
  noHeader?: boolean;
  close?: () => void;
  available?: LayoutPanel[];
  style?: any;
}

const LayoutTitleReactContext = createContext<(title: string) => void>(null as any);

export function useSetCustomTitle() {
  return useContext(LayoutTitleReactContext);
}

const ModularPanelWrapper = styled.div<{ $floating?: boolean; $state?: TransitionStatus; $flipped?: boolean }>`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
  transition: transform 300ms;

  &[data-header="false"] {
    border-top: 1px solid #e4e7f0;
  }

  &[data-floating="true"] {
    margin: 10px;
    border-radius: 5px;
    overflow: hidden;
    background: #fff;
  }

  &[data-state="entering"],
  &[data-state="entered"] {
    transform: translateX(0);
  }

  &[data-state="exiting"],
  &[data-state="exited"] {
    transform: translateX(100%);
  }

  &[data-state="exiting"][data-flipped="true"],
  &[data-state="exited"][data-flipped="true"] {
    transform: translateX(0);
  }

  &[data-state="exiting"][data-flipped="false"],
  &[data-state="exited"][data-flipped="false"] {
    transform: translateX(100%);
  }

  &[data-state="entering"][data-flipped="true"],
  &[data-state="entered"][data-flipped="true"] {
    transform: translateX(0);
  }

  &[data-state="entering"][data-flipped="false"],
  &[data-state="entered"][data-flipped="false"] {
    transform: translateX(100%);
  }

  &[data-state="unmounted"] {
    transform: translateX(100%);
  }
`;

export const ModularPanelHeader = styled.div<{ $tabs?: boolean; $error?: boolean }>`
  background: #fff;
  display: flex;
  height: 2.8em;
  align-items: center;
  z-index: 2;

  &[data-tabs="true"] {
    box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
  }

  &[data-tabs="false"] {
    box-shadow:
      inset 0 -1px 0 0 rgba(0, 0, 0, 0.17),
      inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
  }

  &[data-error="true"] {
    color: #b61717;
    background: #ffc2d2;
    box-shadow: inset 0 -5px 10px 0 rgba(255, 255, 255, 0.5);
  }
`;

export const ModulePanelButton = styled.button`
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

const ModularPanelLabel = styled.div`
  font-size: 0.875em;
  flex: 1 1 0px;
  padding-left: 1em;
  text-align: center;
  align-self: center;
`;

const ModularPanelContent = styled.div`
  flex: 1 1 0px;
  display: flex;

  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;

  > * {
    min-width: 0;
  }
`;

export function ModularPanel({
  panel,
  state,
  actions,
  isLeft,
  pinActions = actions as any,
  transition,
  close,
  available = [],
  style,
  noHeader,
}: ModularPanelProps) {
  const vault = useContext(ReactVaultContext) || null;
  const [didError, setDidError] = useState(false);
  const appState = useAppState();
  const layout = useLayoutProvider();
  const { tabs, pinnable, hideHeader } = panel?.options || {};
  const resetKeys = [appState.state.canvasId, panel?.id];
  const switchablePanels = useMemo(() => {
    return (available || []).filter((p) => !p.requiresState);
  }, [available]);
  const { itemProps, isOpen, setIsOpen } = useDropdownMenu(switchablePanels.length);
  const [customTitle, setCustomTitle] = useState("");
  const setCustomTitleRef = useRef<(title: string) => void | undefined>();

  useEffect(() => setDidError(false), resetKeys);

  useEffect(() => setCustomTitle(""), [panel]);

  useEffect(() => {
    setCustomTitleRef.current = setCustomTitle;
    return () => {
      setCustomTitleRef.current = undefined;
    };
  }, []);

  const _setCustomTitle = useCallback((title: string) => {
    if (setCustomTitleRef.current) {
      setCustomTitleRef.current(title);
    }
  }, []);

  const backAction = useCallback(
    (e?: React.MouseEvent) => {
      const originalCallback = panel
        ? state.stack.length
          ? actions.popStack
          : panel.backAction
            ? () => panel && panel.backAction && panel.backAction(state, { ...layout, current: actions }, appState)
            : null
        : null;

      if (e && (!originalCallback || e.metaKey) && switchablePanels.length) {
        e.preventDefault();
        setIsOpen(true);
      } else {
        originalCallback && originalCallback();
      }
    },
    [actions, appState, layout, panel, setIsOpen, state, switchablePanels.length]
  );

  const menuHandler = (newPanel: LayoutPanel) => {
    actions.change({
      id: newPanel.id,
      state: newPanel.defaultState,
      stacked: !!(state.stack.length || panel?.backAction),
    });
  };

  if (!panel || !state.current) {
    return null;
  }

  const backButton =
    panel.backAction || state.stack.length ? (
      <ModulePanelButton onClick={backAction}>
        <BackIcon />
      </ModulePanelButton>
    ) : null;

  const closeButton = (
    <ModulePanelButton onClick={close || actions.close}>
      <CloseIcon />
    </ModulePanelButton>
  );

  return (
    <LayoutTitleReactContext.Provider value={_setCustomTitle}>
      <ModularPanelWrapper data-state={transition} data-flipped={isLeft} style={style} data-header={!noHeader}>
        {noHeader ? null : (
          <ModularPanelHeader data-tabs={!!tabs} data-error={didError}>
            <Dropdown style={{ display: "flex", height: "100%" }}>
              {panel.renderBackAction ? panel.renderBackAction({ backAction, fallback: backButton }) : backButton}
              {switchablePanels.length ? (
                <DropdownMenu $open={isOpen} style={{ left: "0.5em" }}>
                  <DropdownLabel>All panels</DropdownLabel>
                  <DropdownDivider />
                  {switchablePanels.map((newPanel, i) => (
                    <DropdownItem
                      key={i}
                      {...(itemProps as any)[i]}
                      onClick={() => menuHandler(newPanel)}
                      $active={panel.id === newPanel.id}
                    >
                      {newPanel.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              ) : null}
            </Dropdown>

            {customTitle ? (
              <ModularPanelLabel>{customTitle}</ModularPanelLabel>
            ) : hideHeader ? (
              <ModulePanelSpacer />
            ) : (
              <ModularPanelLabel>{panel.label}</ModularPanelLabel>
            )}
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
            {panel.renderCloseAction
              ? panel.renderCloseAction({ closeAction: close || actions.close, fallback: closeButton })
              : closeButton}
          </ModularPanelHeader>
        )}
        <ModularPanelContent className={OverrideScrollbar}>
          <ErrorBoundary
            // onResetKeysChange={() => setDidError(false)}
            onError={() => setDidError(true)}
            FallbackComponent={PanelError}
            resetKeys={resetKeys}
            onReset={() => setDidError(false)}
          >
            {renderHelper(
              panel.render(
                state.state || panel.defaultState || {},
                { ...layout, current: actions, vault: vault as any, transition },
                appState
              )
            )}
          </ErrorBoundary>
        </ModularPanelContent>
      </ModularPanelWrapper>
    </LayoutTitleReactContext.Provider>
  );
}
