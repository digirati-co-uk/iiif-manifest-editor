import { LayoutProps } from "./Layout.types";
import { useLayoutProvider } from "./Layout.context";
import { memo, useEffect } from "react";
import * as L from "./Layout.styles";
import { ModularPanel } from "./components/ModularPanel";
import { HandleControls } from "./components/HandleControls";
import { useResizeLayout } from "../../madoc/use-resize-layouts";
import equal from "shallowequal";

export const Layout = memo(function Layout(props: LayoutProps) {
  const { loading, state, leftPanels, centerPanels, rightPanels, actions } = useLayoutProvider();
  const leftPanelResizer = useResizeLayout("left-panel", { left: true, minWidthPx: 320, maxWidthPx: 500, loading });
  const rightPanelResizer = useResizeLayout("right-panel", { left: false, minWidthPx: 320, maxWidthPx: 500, loading });

  // @todo create new custom hooks.
  // This layout is intended to be one of many using the same hooks.
  // So you could have an iPad layout, or iPhone layout, or completely different layouts
  const leftPanel = leftPanels.find((panel) => panel.id === state.leftPanel.current);
  const rightPanel = rightPanels.find((panel) => panel.id === state.rightPanel.current);
  const centerPanel = centerPanels.find((panel) => panel.id === state.centerPanel.current);
  const pinnedRightPanel = state.pinnedRightPanel.pinned
    ? rightPanels.find((panel) => panel.id === state.pinnedRightPanel.current)
    : undefined;

  // Pinned state
  const showRightPanel =
    rightPanel &&
    (pinnedRightPanel?.id !== rightPanel.id || !equal(state.pinnedRightPanel.state, state.rightPanel.state));
  const resetLeftPanel =
    leftPanelResizer.widthB !== "auto"
      ? () => leftPanelResizer.setWidths({ widthA: "auto", widthB: "auto" } as any)
      : undefined;
  const resetRightPanel =
    rightPanelResizer.widthB !== "auto"
      ? () => rightPanelResizer.setWidths({ widthA: "auto", widthB: "auto" } as any)
      : undefined;

  useEffect(() => {
    // @todo to enable dynamic layouts, we need this effect to run IF the props change.
    actions.setAvailable(props);
    props.rightPanels.length && actions.rightPanel.change({ id: props.rightPanels[0].id });
    props.leftPanels.length && actions.leftPanel.change({ id: props.leftPanels[0].id });
    props.centerPanels.length && actions.centerPanel.change({ id: props.centerPanels[0].id });

    // actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    // It will render as soon as possible, downside of hoisting the layout provider
    // Unlikely this will be hit because of flushSync, but best to check.
    return null;
  }

  // This is a big ol' work in progress.
  return (
    <L.OuterWrapper className={props.className}>
      <L.Header>
        {props.header || null}
        {props.menu ? <menu>{props.menu}</menu> : null}
      </L.Header>
      <L.Main
        ref={(div) => {
          leftPanelResizer.refs.container.current = div;
          rightPanelResizer.refs.container.current = div;
        }}
      >
        {props.leftPanels.length > 0 ? (
          <>
            <L.LeftPanel
              ref={leftPanelResizer.refs.resizableDiv}
              style={{ width: state.leftPanel.open ? leftPanelResizer.widthB : undefined }}
            >
              <L.PanelContainer $menu={props.leftPanelMenuPosition || "bottom"}>
                {props.leftPanelMenu ? (
                  <L.PanelMenu $open={state.leftPanel.open} $position={props.leftPanelMenuPosition || "bottom"}>
                    {props.leftPanelMenu}
                  </L.PanelMenu>
                ) : null}
                <L.PanelContent>
                  {state.leftPanel.open ? (
                    <>
                      {leftPanel ? (
                        <ModularPanel panel={leftPanel} state={state.leftPanel} actions={actions.leftPanel} />
                      ) : null}
                    </>
                  ) : null}
                </L.PanelContent>
              </L.PanelContainer>
            </L.LeftPanel>
            <HandleControls
              ref={leftPanelResizer.refs.resizer}
              reset={resetLeftPanel}
              dir="left"
              open={state.leftPanel.open}
              actions={actions.leftPanel}
            />{" "}
          </>
        ) : null}
        <L.CenterPanel>
          <L.PanelContainer $menu={props.centerPanelMenuPosition || "top"}>
            {props.centerPanelMenu ? (
              <L.PanelMenu $open={state.centerPanel.open} $position={props.centerPanelMenuPosition || "top"}>
                {props.centerPanelMenu}
              </L.PanelMenu>
            ) : null}
            <L.PanelContent>
              {state.centerPanel.open ? (centerPanel ? centerPanel.render(state.centerPanel.state) : null) : null}
            </L.PanelContent>
          </L.PanelContainer>
        </L.CenterPanel>
        {props.rightPanels.length > 0 ? (
          <>
            <HandleControls
              ref={rightPanelResizer.refs.resizer}
              dir="right"
              reset={resetRightPanel}
              open={state.rightPanel.open}
              actions={actions.rightPanel}
            />
            <L.RightPanel
              ref={rightPanelResizer.refs.resizableDiv}
              style={{ width: state.rightPanel.open ? rightPanelResizer.widthB : undefined }}
            >
              <L.PanelContainer $menu={props.rightPanelMenuPosition || "bottom"}>
                {props.rightPanelMenu ? (
                  <L.PanelMenu $open={state.rightPanel.open} $position={props.rightPanelMenuPosition || "bottom"}>
                    {props.rightPanelMenu}
                  </L.PanelMenu>
                ) : null}
                <L.PanelContent>
                  {state.rightPanel.open ? (
                    <>
                      {pinnedRightPanel ? (
                        <ModularPanel
                          panel={pinnedRightPanel}
                          state={state.pinnedRightPanel}
                          actions={actions.pinnedRightPanel}
                          close={actions.rightPanel.close}
                        />
                      ) : null}

                      {showRightPanel ? (
                        <ModularPanel
                          panel={rightPanel}
                          state={state.rightPanel}
                          actions={actions.rightPanel}
                          pinActions={actions.pinnedRightPanel}
                        />
                      ) : null}
                    </>
                  ) : null}
                </L.PanelContent>
              </L.PanelContainer>
            </L.RightPanel>
          </>
        ) : null}
      </L.Main>
      <L.Footer>{props.footer || null}</L.Footer>
    </L.OuterWrapper>
  );
});
