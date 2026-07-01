import { DefaultTooltipContent, Modal, Tooltip, TooltipTrigger } from "@manifest-editor/components";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { GhostBlocks } from "@manifest-editor/ui/ui/GhostBlocks/GhostBlocks";
import { type CSSProperties, Fragment, memo, useContext, useLayoutEffect, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ReactVaultContext, useVaultSelector } from "react-iiif-vault";
import equal from "shallowequal";
import { useApp, useAppState } from "../AppContext/AppContext";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { BackgroundActionsMount, BackgroundActionToasts } from "../BackgroundTasks/BackgroundActions";
import { useEvent } from "../hooks/use-event";
import { ModularPanel } from "./components/ModularPanel";
import { PanelError } from "./components/PanelError";
import type { LayoutRenderProps } from "./Layout";
import { LayoutModeReactContext, useLayoutProvider } from "./Layout.context";
import * as F from "./Layout.focused.styles";
import { panelSizing, renderHelper } from "./Layout.helpers";
import * as L from "./Layout.styles";
import { filterSupportedPanels, getSupportedPanelFallback, panelIds } from "./Layout.supports";
import type { LayoutPanel } from "./Layout.types";

function getEditedResourceType(data: unknown) {
  const resource = (data as any)?.resource;
  return resource?.source?.type || resource?.type || null;
}

export const FocusedLayout = memo(function FocusedLayout(props: LayoutRenderProps) {
  const app = useApp();
  const appState = useAppState();
  const rootResource = useAppResource();
  const layout = useLayoutProvider();
  const { vault: _vault } = useContext(ReactVaultContext);
  const vault = _vault || undefined;
  const vaultState = useVaultSelector((state) => state.iiif);
  const {
    loading,
    state,
    leftPanels: configuredLeftPanels,
    centerPanels: configuredCenterPanels,
    rightPanels: configuredRightPanels,
    modals: configuredModals = [],
    actions,
  } = layout;
  const isLoading = props.isLoading || false;

  const supportContext = useMemo(
    () => ({
      rootResource,
      vault,
      app,
      layoutState: state,
      appState,
    }),
    [rootResource, vault, app, state, appState, vaultState],
  );

  const leftPanels = useMemo(
    () =>
      filterSupportedPanels(configuredLeftPanels, supportContext, (panel, error) => {
        console.error(`Layout panel "${panel.id}" failed support check`, error);
      }).filter((panel) => !panel.focusedMode?.hide),
    [configuredLeftPanels, supportContext],
  );
  const centerPanels = useMemo(
    () =>
      filterSupportedPanels(configuredCenterPanels, supportContext, (panel, error) => {
        console.error(`Layout panel "${panel.id}" failed support check`, error);
      }),
    [configuredCenterPanels, supportContext],
  );
  const rightPanels = useMemo(
    () =>
      filterSupportedPanels(configuredRightPanels, supportContext, (panel, error) => {
        console.error(`Layout panel "${panel.id}" failed support check`, error);
      }).filter((panel) => !panel.focusedMode?.hide),
    [configuredRightPanels, supportContext],
  );
  const modals = useMemo(
    () =>
      filterSupportedPanels(configuredModals, supportContext, (panel, error) => {
        console.error(`Layout panel "${panel.id}" failed support check`, error);
      }),
    [configuredModals, supportContext],
  );
  const modalLeftPanels = useMemo(() => leftPanels.filter((panel) => panel.modal), [leftPanels]);
  const dockedLeftPanels = useMemo(() => leftPanels.filter((panel) => !panel.modal), [leftPanels]);
  const modalPanels = useMemo(() => [...modals, ...modalLeftPanels], [modals, modalLeftPanels]);

  const supportedLayout = useMemo(
    () => ({
      ...layout,
      leftPanels,
      centerPanels,
      rightPanels,
      modals: modalPanels,
    }),
    [layout, leftPanels, centerPanels, rightPanels, modalPanels],
  );

  const leftPanel = dockedLeftPanels.find((panel) => panel.id === state.leftPanel.current);
  const rightPanel = rightPanels.find((panel) => panel.id === state.rightPanel.current);
  const centerPanel = centerPanels.find((panel) => panel.id === state.centerPanel.current);
  const modalToRender = modalPanels.find((panel) => panel.id === state.modal.current);
  const activeLeftPanelId =
    state.modal.open && modalLeftPanels.some((panel) => panel.id === state.modal.current)
      ? state.modal.current
      : state.leftPanel.current;
  const pinnedRightPanel = state.pinnedRightPanel.pinned
    ? rightPanels.find((panel) => panel.id === state.pinnedRightPanel.current)
    : undefined;
  const showRightPanel =
    rightPanel &&
    (pinnedRightPanel?.id !== rightPanel.id || !equal(state.pinnedRightPanel.state, state.rightPanel.state));
  const focusedPanelContext = useMemo(
    () => ({
      rootResource,
      vault,
      app,
      layoutState: state,
      appState,
      actions,
    }),
    [rootResource, vault, app, state, appState, actions],
  );
  const handleFocusedPanelSelect = (panel: LayoutPanel) => {
    panel.focusedMode?.onSelect?.(focusedPanelContext);
  };
  const closeLeftPanelOnMainPanelClick = !leftPanel || leftPanel.focusedMode?.closeOnMainPanelClick !== false;

  const backgroundItems = useMemo(() => {
    return (layout.background || []).map((bg, key) => {
      return <Fragment key={key}>{bg.render()}</Fragment>;
    });
  }, [layout.background]);

  useLayoutEffect(() => {
    rightPanels.length && actions.rightPanel.change({ id: rightPanels[0]!.id });
    dockedLeftPanels.length && actions.leftPanel.change({ id: dockedLeftPanels[0]!.id });
    centerPanels.length && actions.centerPanel.change({ id: centerPanels[0]!.id });
    actions.leftPanel.close();
    actions.rightPanel.close();

    // actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (centerPanel && centerPanel.onMount) {
      return centerPanel.onMount(
        state.centerPanel.state || centerPanel.defaultState || {},
        {
          ...supportedLayout,
          current: actions.centerPanel,
          vault: vault as any,
        },
        appState,
      );
    }
  }, [state.centerPanel.current, centerPanel?.id]);

  useLayoutEffect(() => {
    if (!state.leftPanel.open || !state.leftPanel.current) {
      return;
    }

    const selectedLeftPanel = leftPanels.find((panel) => panel.id === state.leftPanel.current);
    if (selectedLeftPanel?.focusedMode?.onSelect) {
      handleFocusedPanelSelect(selectedLeftPanel);
    }
  }, [state.leftPanel.open, state.leftPanel.current, panelIds(leftPanels)]);

  useLayoutEffect(() => {
    if (state.leftPanel.current && !leftPanel) {
      const fallback = getSupportedPanelFallback(dockedLeftPanels, state.leftPanel.current);
      if (fallback) {
        actions.leftPanel.change({ id: fallback });
      } else {
        actions.leftPanel.close();
      }
    }

    if (state.centerPanel.current && !centerPanel) {
      const fallback = getSupportedPanelFallback(centerPanels, state.centerPanel.current);
      if (fallback) {
        actions.centerPanel.change({ id: fallback });
      } else {
        actions.centerPanel.close();
      }
    }

    if (state.rightPanel.current && !rightPanel) {
      const fallback = getSupportedPanelFallback(rightPanels, state.rightPanel.current);
      if (fallback) {
        actions.rightPanel.change({ id: fallback });
      } else {
        actions.rightPanel.close();
      }
    }

    if (state.modal.current && !modalToRender) {
      const fallback = getSupportedPanelFallback(modalPanels, state.modal.current);
      if (fallback) {
        actions.modal.change({ id: fallback });
      } else {
        actions.modal.close();
      }
    }
  }, [
    state.leftPanel.current,
    state.centerPanel.current,
    state.rightPanel.current,
    state.modal.current,
    leftPanel?.id,
    centerPanel?.id,
    rightPanel?.id,
    modalToRender?.id,
    panelIds(dockedLeftPanels),
    panelIds(centerPanels),
    panelIds(rightPanels),
    panelIds(modalPanels),
  ]);

  useEvent<{ "layout.edit": unknown }, "layout.edit">(
    "layout.edit",
    (data) => {
      if (getEditedResourceType(data) === "Canvas" && !state.rightPanel.open) {
        return;
      }

      if (rightPanels.find((panel) => panel.id === "@manifest-editor/editor")) {
        actions.rightPanel.open({
          id: "@manifest-editor/editor",
          stacked: true,
        });
      } else if (rightPanel) {
        actions.rightPanel.open();
      }
    },
    [panelIds(rightPanels), rightPanel?.id, state.rightPanel.open],
  );

  const sidebarSmall = "4.5rem";
  const leftPanelWidth = `${panelSizing({
    options: leftPanel?.options,
    fallback: 340,
  })}px`;
  const rightPanelWidth = `${panelSizing({
    options: rightPanel?.options,
    fallback: 420,
  })}px`;
  const layoutVariables = {
    "--manifest-editor-layout-left-sidebar-small": sidebarSmall,
    "--manifest-editor-layout-left-sidebar-large": state.leftPanel.open
      ? `calc(${sidebarSmall} + ${leftPanelWidth})`
      : sidebarSmall,
    "--manifest-editor-layout-right-sidebar-small": sidebarSmall,
    "--manifest-editor-layout-right-sidebar-large": state.rightPanel.open
      ? `calc(${sidebarSmall} + ${rightPanelWidth})`
      : sidebarSmall,
  } as CSSProperties & Record<string, string>;

  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const previousValues: Array<[string, string]> = Object.keys(layoutVariables).map((key) => [
      key,
      root.style.getPropertyValue(key),
    ]);

    for (const [key, value] of Object.entries(layoutVariables)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const [key, value] of previousValues) {
        if (value) {
          root.style.setProperty(key, value);
        } else {
          root.style.removeProperty(key);
        }
      }
    };
  }, [leftPanelWidth, rightPanelWidth, state.leftPanel.open, state.rightPanel.open]);

  if (loading) {
    return null;
  }

  const renderSidePanelSwitcher = (side: "left" | "right", panels: LayoutPanel[], current: string | null) => {
    if (!panels.length) {
      return null;
    }

    const panelActions = side === "left" ? actions.leftPanel : actions.rightPanel;

    return (
      <F.PanelSwitcher $side={side} aria-label={`${side} panels`}>
        {panels.map((panel) => (
          <Tooltip placement={side === "left" ? "right" : "left"} key={panel.id}>
            <TooltipTrigger asChild>
              <F.PanelSwitchButton
                type="button"
                aria-label={panel.label}
                data-selected={current === panel.id}
                onClick={() => {
                  if (current === panel.id) {
                    panelActions.toggle();
                  } else {
                    panelActions.open({ id: panel.id });
                  }
                }}
              >
                {panel.icon || panel.label.slice(0, 1)}
              </F.PanelSwitchButton>
            </TooltipTrigger>
            <DefaultTooltipContent>{panel.label}</DefaultTooltipContent>
          </Tooltip>
        ))}
      </F.PanelSwitcher>
    );
  };

  const renderFocusedLeftSwitcher = () => {
    if (!centerPanels.length && !leftPanels.length) {
      return null;
    }

    return (
      <F.PanelSwitcher $side="left" aria-label="Main and left panels">
        {centerPanels.length ? (
          <F.PanelSwitchGroup aria-label="Main panels">
            {centerPanels
              .filter((panel) => !panel.focusedMode?.hide)
              .map((panel) => (
                <Tooltip placement="right" key={panel.id}>
                  <TooltipTrigger asChild>
                    <F.PanelSwitchButton
                      type="button"
                      aria-label={panel.label}
                      data-selected={state.centerPanel.current === panel.id}
                      onClick={() => {
                        actions.centerPanel.open({ id: panel.id });
                        actions.leftPanel.close();
                        actions.rightPanel.close();
                        handleFocusedPanelSelect(panel);
                      }}
                    >
                      {panel.icon || panel.label.slice(0, 1)}
                    </F.PanelSwitchButton>
                  </TooltipTrigger>
                  <DefaultTooltipContent>{panel.label}</DefaultTooltipContent>
                </Tooltip>
              ))}
          </F.PanelSwitchGroup>
        ) : null}
        {centerPanels.length && leftPanels.length ? <F.PanelSwitchDivider /> : null}
        {leftPanels.length ? (
          <F.PanelSwitchGroup aria-label="Left panels">
            {leftPanels.map((panel) => (
              <Tooltip placement="right" key={panel.id}>
                <TooltipTrigger asChild>
                  <F.PanelSwitchButton
                    type="button"
                    aria-label={panel.label}
                    data-selected={activeLeftPanelId === panel.id}
                    onClick={() => {
                      if (panel.modal) {
                        if (state.modal.open && state.modal.current === panel.id) {
                          actions.modal.close();
                        } else {
                          actions.modal.open({ id: panel.id, state: panel.defaultState });
                          handleFocusedPanelSelect(panel);
                        }
                        return;
                      }
                      if (state.leftPanel.current === panel.id) {
                        actions.leftPanel.toggle();
                      } else {
                        actions.leftPanel.open({ id: panel.id });
                      }
                    }}
                  >
                    {panel.icon || panel.label.slice(0, 1)}
                  </F.PanelSwitchButton>
                </TooltipTrigger>
                <DefaultTooltipContent>{panel.label}</DefaultTooltipContent>
              </Tooltip>
            ))}
          </F.PanelSwitchGroup>
        ) : null}
      </F.PanelSwitcher>
    );
  };

  const renderModal = () => {
    if (!modalToRender || state.modal.open === false) {
      return null;
    }

    return (
      <Modal title={modalToRender.label} onClose={() => actions.modal.close()}>
        {modalToRender.modal ? (
          <div className="h-[70vh] min-h-[60vh] max-h-full flex w-full">
            <ModularPanel isLeft isModal noHeader panel={modalToRender} state={state.modal} actions={actions.modal} />
          </div>
        ) : (
          renderHelper(
            modalToRender.render(
              state.modal.state || modalToRender.defaultState || {},
              { ...supportedLayout, current: actions.modal, vault: vault, isModal: true },
              appState,
            ),
          )
        )}
      </Modal>
    );
  };

  const renderCenterPanel = () => (
    <L.PanelContainer $menu={props.centerPanelMenuPosition || "top"}>
      {props.centerPanelMenu ? (
        <L.PanelMenu $open={state.centerPanel.open} $position={props.centerPanelMenuPosition || "top"}>
          {props.centerPanelMenu}
        </L.PanelMenu>
      ) : null}
      <L.PanelContent>
        <ErrorBoundary resetKeys={[centerPanel?.id]} FallbackComponent={PanelError}>
          {isLoading ? (
            <F.LoadingCenter>
              <Spinner stroke="rgba(0,0,0,.3)" fontSize={"2em"} />
            </F.LoadingCenter>
          ) : state.centerPanel.open ? (
            centerPanel ? (
              renderHelper(
                centerPanel.render(
                  state.centerPanel.state || centerPanel.defaultState || {},
                  {
                    ...supportedLayout,
                    current: actions.centerPanel,
                    vault: vault,
                  },
                  appState,
                ),
              )
            ) : null
          ) : null}
        </ErrorBoundary>
      </L.PanelContent>
    </L.PanelContainer>
  );

  const renderLeftPanel = () => (
    <F.FloatingPanelBody>
      {isLoading ? (
        <L.PanelContent>
          <GhostBlocks />
        </L.PanelContent>
      ) : (
        <>
          {props.leftPanelMenu ? (
            <L.PanelMenu $open={state.leftPanel.open} $position={props.leftPanelMenuPosition || "bottom"}>
              {props.leftPanelMenu}
            </L.PanelMenu>
          ) : null}
          <L.PanelContent>
            {leftPanel ? (
              <ModularPanel isLeft panel={leftPanel} state={state.leftPanel} actions={actions.leftPanel} />
            ) : null}
          </L.PanelContent>
        </>
      )}
    </F.FloatingPanelBody>
  );

  const renderRightPanel = () => (
    <F.FloatingPanelBody>
      {isLoading ? (
        <L.PanelContent>
          <GhostBlocks />
        </L.PanelContent>
      ) : (
        <>
          {props.rightPanelMenu ? (
            <L.PanelMenu $open={state.rightPanel.open} $position={props.rightPanelMenuPosition || "bottom"}>
              {props.rightPanelMenu}
            </L.PanelMenu>
          ) : null}
          <L.PanelContent>
            {showRightPanel ? (
              <ModularPanel
                panel={rightPanel}
                state={state.rightPanel}
                actions={actions.rightPanel}
                pinActions={actions.pinnedRightPanel}
                available={rightPanels}
              />
            ) : null}

            {pinnedRightPanel ? (
              <ModularPanel
                panel={pinnedRightPanel}
                state={state.pinnedRightPanel}
                actions={actions.pinnedRightPanel}
                close={actions.rightPanel.close}
              />
            ) : null}
          </L.PanelContent>
        </>
      )}
    </F.FloatingPanelBody>
  );

  return (
    <LayoutModeReactContext.Provider value="focused">
      <L.OuterWrapper
        id={props.htmlId || "manifest-editor-container"}
        className={`manifest-editor ${props.className || ""}`}
        data-layout-mode="focused"
        style={layoutVariables}
      >
        {props.hideHeader ? null : (
          <L.Header>
            {props.header || null}
            {props.menu ? <menu>{props.menu}</menu> : null}
          </L.Header>
        )}
        <F.Main>
          <F.CenterPanel
            onClick={() => {
              if (closeLeftPanelOnMainPanelClick) {
                actions.leftPanel.close();
              }
            }}
          >
            {renderCenterPanel()}
          </F.CenterPanel>

          {renderFocusedLeftSwitcher()}
          {renderSidePanelSwitcher("right", rightPanels, state.rightPanel.current)}

          {dockedLeftPanels.length > 0 ? (
            <F.FloatingPanel
              $side="left"
              $open={state.leftPanel.open}
              style={{
                width: leftPanelWidth,
                minWidth: leftPanel?.options?.minWidth,
                maxWidth: leftPanel?.options?.maxWidth,
              }}
            >
              {renderLeftPanel()}
            </F.FloatingPanel>
          ) : null}

          {rightPanels.length > 0 ? (
            <F.FloatingPanel
              $side="right"
              $open={state.rightPanel.open}
              style={{
                width: rightPanelWidth,
                minWidth: rightPanel?.options?.minWidth,
                maxWidth: rightPanel?.options?.maxWidth,
              }}
            >
              {renderRightPanel()}
            </F.FloatingPanel>
          ) : null}
        </F.Main>
        <L.Footer>{props.footer || null}</L.Footer>

        <div className="hidden">{backgroundItems}</div>
        <BackgroundActionsMount />
        <BackgroundActionToasts />

        <>{renderModal()}</>
      </L.OuterWrapper>
    </LayoutModeReactContext.Provider>
  );
});
