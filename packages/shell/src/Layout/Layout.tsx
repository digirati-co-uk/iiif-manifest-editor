// import { LayoutProps } from "./Layout.types";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { GhostBlocks } from "@manifest-editor/ui/ui/GhostBlocks/GhostBlocks";
import { memo, useContext, useLayoutEffect } from "react";
import { ReactVaultContext } from "react-iiif-vault";
import { Transition, TransitionStatus } from "react-transition-group";
import equal from "shallowequal";
import { useAppState } from "../AppContext/AppContext";
import { useLayoutProvider } from "./Layout.context";
import { panelSizing, renderHelper } from "./Layout.helpers";
import * as M from "./Layout.mobile";
import * as L from "./Layout.styles";
import { HandleControls } from "./components/HandleControls";
import { ModularPanel } from "./components/ModularPanel";
import { useResizeLayout } from "./components/use-resize-layouts";
import { useMatchMedia } from "../hooks/use-match-media";
import { StarIcon } from "@manifest-editor/ui/icons/StarIcon";
import { PanelSideMenu } from "@manifest-editor/components";

interface LayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  menu?: React.ReactNode;
  leftPanelMenu?: React.ReactNode;
  rightPanelMenu?: React.ReactNode;
  centerPanelMenu?: React.ReactNode;
  leftPanelMenuPosition?: "top" | "bottom";
  rightPanelMenuPosition?: "top" | "bottom";
  hideHeader?: boolean;
  isLoading?: boolean;
  className?: string;
  centerPanelMenuPosition?: "top" | "bottom";
}

export const Layout = memo(function Layout(props: LayoutProps) {
  const appState = useAppState();
  const layout = useLayoutProvider();
  const { vault: _vault } = useContext(ReactVaultContext);
  const vault = _vault || undefined;
  const { loading, state, leftPanels, centerPanels, rightPanels, actions } = layout;
  const leftPanel = leftPanels.find((panel) => panel.id === state.leftPanel.current);
  const rightPanel = rightPanels.find((panel) => panel.id === state.rightPanel.current);
  const centerPanel = centerPanels.find((panel) => panel.id === state.centerPanel.current);
  const enableMotion = true;
  const pinnedRightPanel = state.pinnedRightPanel.pinned
    ? rightPanels.find((panel) => panel.id === state.pinnedRightPanel.current)
    : undefined;
  const [mobile] = useMatchMedia(["(max-width: 1020px)"]);

  const isLoading = props.isLoading || false;

  // Resizers
  const leftPanelResizer = useResizeLayout(`left-panel/${leftPanel?.id}`, {
    left: true,
    minWidthPx: leftPanel?.options?.minWidth || 200,
    maxWidthPx: leftPanel?.options?.maxWidth || 720,
    loading,
  });
  const rightPanelResizer = useResizeLayout(`right-panel/${rightPanel?.id}`, {
    left: false,
    minWidthPx: rightPanel?.options?.minWidth || 320,
    maxWidthPx: rightPanel?.options?.maxWidth || 720,
    loading,
  });

  // Pinned state
  const showRightPanel =
    rightPanel &&
    (pinnedRightPanel?.id !== rightPanel.id || !equal(state.pinnedRightPanel.state, state.rightPanel.state));
  const resetLeftPanel =
    leftPanelResizer.widthB !== "auto"
      ? () =>
          leftPanelResizer.setWidths({
            widthA: "auto",
            widthB: panelSizing({
              options: leftPanel?.options,
              fallback: 320,
            }),
          } as any)
      : undefined;
  const resetRightPanel =
    rightPanelResizer.widthB !== "auto"
      ? () =>
          rightPanelResizer.setWidths({
            widthA: "auto",
            widthB: panelSizing({
              options: rightPanel?.options,
              fallback: 320,
            }),
          } as any)
      : undefined;

  // Remove dynamic layouts for now.
  // useEffect(() => {
  //   // @todo to enable dynamic layouts, we need this effect to run IF the props change.
  //   actions.setAvailable(props);
  //   props.rightPanels.length && actions.rightPanel.change({ id: props.rightPanels[0]!.id });
  //   props.leftPanels.length && actions.leftPanel.change({ id: props.leftPanels[0]!.id });
  //   props.centerPanels.length && actions.centerPanel.change({ id: props.centerPanels[0]!.id });

  //   // actions are stable.
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useLayoutEffect(() => {
    if (mobile && state.leftPanel.open && state.rightPanel.open) {
      actions.leftPanel.close();
      actions.rightPanel.close();
    }
  }, [mobile]);

  useLayoutEffect(() => {
    if (centerPanel && centerPanel.onMount) {
      return centerPanel.onMount(
        state.centerPanel.state || centerPanel.defaultState || {},
        { ...layout, current: actions.centerPanel, vault: vault as any },
        appState
      );
    }
  }, [state.centerPanel.current]);

  useLayoutEffect(() => {
    // @todo to enable dynamic layouts, we need this effect to run IF the props change.
    // actions.setAvailable(props);
    rightPanels.length && actions.rightPanel.change({ id: rightPanels[0]!.id });
    leftPanels.length && actions.leftPanel.change({ id: leftPanels[0]!.id });
    centerPanels.length && actions.centerPanel.change({ id: centerPanels[0]!.id });

    // actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    // It will render as soon as possible, downside of hoisting the layout provider
    // Unlikely this will be hit because of flushSync, but best to check.
    return null;
  }

  // Build our panels here.

  const renderLeftPanel = (transition?: TransitionStatus) => (
    <L.PanelContainer
      $menu={props.leftPanelMenuPosition || "bottom"}
      ref={leftPanelResizer.refs.resizableDiv}
      className={transition && enableMotion ? `transition transition-${transition}` : ""}
      style={{
        width: state.leftPanel.open || transition !== "exited" ? leftPanelResizer.widthB : undefined,
        minWidth: leftPanel?.options?.minWidth,
      }}
    >
      {isLoading ? (
        <L.PanelContent>
          <GhostBlocks />
        </L.PanelContent>
      ) : (
        <>
          {props.leftPanelMenu ? (
            <L.PanelMenu
              $open={state.leftPanel.open && transition !== "exited"}
              $position={props.leftPanelMenuPosition || "bottom"}
            >
              {props.leftPanelMenu}
            </L.PanelMenu>
          ) : null}
          <L.PanelContent>
            {state.leftPanel.open || transition !== "exited" ? (
              <>
                {leftPanel ? (
                  <ModularPanel
                    isLeft
                    noHeader
                    transition={transition}
                    panel={leftPanel}
                    state={state.leftPanel}
                    actions={actions.leftPanel}
                  />
                ) : null}
              </>
            ) : null}
          </L.PanelContent>
        </>
      )}
    </L.PanelContainer>
  );

  const renderCenterPanel = () => (
    <L.PanelContainer $menu={props.centerPanelMenuPosition || "top"}>
      {props.centerPanelMenu ? (
        <L.PanelMenu $open={state.centerPanel.open} $position={props.centerPanelMenuPosition || "top"}>
          {props.centerPanelMenu}
        </L.PanelMenu>
      ) : null}
      <L.PanelContent>
        {isLoading ? (
          <div style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Spinner stroke="rgba(0,0,0,.3)" fontSize={"2em"} />
          </div>
        ) : state.centerPanel.open ? (
          centerPanel ? (
            renderHelper(
              centerPanel.render(
                state.centerPanel.state || centerPanel.defaultState || {},
                { ...layout, current: actions.centerPanel, vault: vault },
                appState
              )
            )
          ) : null
        ) : null}
      </L.PanelContent>
    </L.PanelContainer>
  );

  const renderRightPanel = (transition?: TransitionStatus) => (
    <L.PanelContainer
      $menu={props.rightPanelMenuPosition || "bottom"}
      ref={rightPanelResizer.refs.resizableDiv}
      className={transition && enableMotion ? `transition transition-${transition}` : ""}
      style={{
        width: state.rightPanel.open || transition !== "exited" ? rightPanelResizer.widthB : undefined,
        minWidth: rightPanel?.options?.minWidth,
      }}
    >
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
            {state.rightPanel.open || transition !== "exited" ? (
              <>
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
              </>
            ) : null}
          </L.PanelContent>
        </>
      )}
    </L.PanelContainer>
  );

  if (mobile) {
    return (
      <L.OuterWrapper>
        {props.hideHeader ? null : (
          <L.Header>
            {props.header || null}
            {props.menu ? <menu>{props.menu}</menu> : null}
          </L.Header>
        )}
        <L.Main>
          <M.Container>
            <M.CenterPanel>{renderCenterPanel()}</M.CenterPanel>
            <M.MobileBar>
              {leftPanels.length > 0 ? (
                <M.LeftBarButton onClick={actions.leftPanel.toggle}>{leftPanel?.label}</M.LeftBarButton>
              ) : null}
              {rightPanels.length > 0 ? (
                <M.DrawerContainer>
                  <M.DrawerButton onClick={actions.rightPanel.toggle}>
                    <DownIcon rotate={180} />
                    {rightPanel?.label}
                  </M.DrawerButton>
                </M.DrawerContainer>
              ) : null}
              <M.PreviewBarButton>Preview</M.PreviewBarButton>
            </M.MobileBar>
            {rightPanels.length > 0 ? (
              <M.DrawerBody $open={state.rightPanel.open}>{renderRightPanel()}</M.DrawerBody>
            ) : null}
            {leftPanels.length > 0 ? <M.LeftPanel $open={state.leftPanel.open}>{renderLeftPanel()}</M.LeftPanel> : null}
            {leftPanels.length > 0 || rightPanels.length > 0 ? (
              <M.Lightbox
                $open={state.leftPanel.open || state.rightPanel.open}
                onClick={() => {
                  actions.leftPanel.close();
                  actions.rightPanel.close();
                }}
              />
            ) : null}
          </M.Container>
        </L.Main>
      </L.OuterWrapper>
    );
  }

  // This is a big ol' work in progress.
  return (
    <L.OuterWrapper className={props.className}>
      {props.hideHeader ? null : (
        <L.Header>
          {props.header || null}
          {props.menu ? <menu>{props.menu}</menu> : null}
        </L.Header>
      )}
      <L.Main
        ref={(div) => {
          leftPanelResizer.refs.container.current = div;
          rightPanelResizer.refs.container.current = div;
        }}
      >
        {leftPanels.length > 0 ? (
          <PanelSideMenu
            current={state.leftPanel.current}
            items={leftPanels.map((panel) => ({
              id: panel.id,
              label: panel.label,
              icon: panel.icon,
              onClick: () => {
                if (state.leftPanel.current === panel.id) {
                  actions.leftPanel.toggle();
                } else {
                  actions.leftPanel.change({ id: panel.id });
                }
              },
            }))}
            open={state.leftPanel.open}
          />
        ) : null}

        {leftPanels.length > 0 ? (
          <Transition in={state.leftPanel.open} timeout={enableMotion ? 400 : 0} unmountOnExit={false}>
            {(transition) => (
              <>
                <L.LeftPanel $width={leftPanelResizer.widthB} $state={transition} $motion={enableMotion}>
                  {renderLeftPanel(transition)}
                </L.LeftPanel>
                <HandleControls
                  ref={leftPanelResizer.refs.resizer}
                  reset={resetLeftPanel}
                  dir="left"
                  transition={transition}
                  open={state.leftPanel.open || transition !== "exited"}
                  actions={actions.leftPanel}
                />
              </>
            )}
          </Transition>
        ) : null}
        <L.CenterPanel>{renderCenterPanel()}</L.CenterPanel>
        {rightPanels.length > 0 ? (
          <Transition in={state.rightPanel.open} timeout={enableMotion ? 400 : 0} unmountOnExit={false}>
            {(transition) => (
              <>
                <HandleControls
                  ref={rightPanelResizer.refs.resizer}
                  dir="right"
                  reset={resetRightPanel}
                  open={state.rightPanel.open}
                  actions={actions.rightPanel}
                />
                <L.RightPanel $width={rightPanelResizer.widthB} $state={transition} $motion={enableMotion}>
                  {renderRightPanel(transition)}
                </L.RightPanel>
              </>
            )}
          </Transition>
        ) : null}
      </L.Main>
      <L.Footer>{props.footer || null}</L.Footer>
    </L.OuterWrapper>
  );
});
