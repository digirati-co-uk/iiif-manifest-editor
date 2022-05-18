import { LayoutProps } from "./Layout.types";
import { useLayoutProvider } from "./Layout.context";
import { memo, useEffect } from "react";

export const Layout = memo(function Layout(props: LayoutProps) {
  const { loading, state, leftPanels, centerPanels, rightPanels, actions } = useLayoutProvider();

  // @todo create new custom hooks.
  // This layout is intended to be one of many using the same hooks.
  // So you could have an iPad layout, or iPhone layout, or completely different layouts
  const leftPanel = leftPanels.find((panel) => panel.id === state.leftPanel.current);
  const rightPanel = rightPanels.find((panel) => panel.id === state.rightPanel.current);
  const centerPanel = centerPanels.find((panel) => panel.id === state.centerPanel.current);
  const pinnedRightPanel = state.pinnedRightPanel.pinned
    ? rightPanels.find((panel) => panel.id === state.pinnedRightPanel.current)
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
    <>
      <header>{props.header || null}</header>
      <menu>{props.menu || null}</menu>
      <div style={{ display: "flex" }}>
        {state.leftPanel.open ? (
          <div>
            <h3>LEFT</h3>
            {leftPanel ? <div>{leftPanel.render(state.leftPanel.state)}</div> : null}
          </div>
        ) : null}
        {state.centerPanel.open ? (
          <div>
            <h3>CENTER</h3>
            {centerPanel ? <div>{centerPanel.render(state.centerPanel.state)}</div> : null}
          </div>
        ) : null}
        {state.rightPanel.open ? (
          <div>
            <h3>RIGHT</h3>
            {pinnedRightPanel ? (
              <div>
                <h4>PINNED</h4>
                {pinnedRightPanel.render(state.pinnedRightPanel.state)}
              </div>
            ) : null}
            {rightPanel &&
            (pinnedRightPanel?.id !== rightPanel.id || state.pinnedRightPanel.state !== state.rightPanel.state) ? (
              <div>{rightPanel.render(state.rightPanel.state)}</div>
            ) : null}
          </div>
        ) : null}
      </div>
      <footer>{props.footer || null}</footer>
    </>
  );
});
