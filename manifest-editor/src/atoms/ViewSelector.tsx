import { GridIcon } from "../icons/GridIcon";
import { ThumbnailStripIcon } from "../icons/ThumbnailStripIcon";
import { TreeIcon } from "../icons/TreeIcon";
import { FlexContainerRow } from "../components/layout/FlexContainer";
import { Button } from "./Button";
import { useLayoutActions, useLayoutState } from "@/shell/Layout/Layout.context";
import { useEffect, useState } from "react";
import { VerticalDivider } from "./VerticalDivider";
import { PaddingComponentSmall } from "./PaddingComponent";
import { MenuIcon } from "../icons/MenuIcon";
import { ExperimentalIcon } from "../madoc/components/icons/ExperimentalIcon";
import { BlockIcon } from "../icons/BlockIcon";
import { CopyIcon } from "../icons/CopyIcon";

export const ViewSelector: React.FC = () => {
  const actions = useLayoutActions();
  const layout = useLayoutState();
  const [activeLeftPanelState, setActiveLeftPanelState] = useState(layout.leftPanel.current);
  const [activeCenterPanelState, setActiveCenterPanelState] = useState(layout.centerPanel.current);
  const [leftPanelIsOpen, setActiveLeftIsOpen] = useState(false);

  useEffect(() => {
    setActiveLeftIsOpen(layout.leftPanel.open);
    setActiveLeftPanelState(layout.leftPanel.current);
    setActiveCenterPanelState(layout.centerPanel.current);
  }, [layout]);

  return (
    <FlexContainerRow justify="center">
      <Button
        onClick={() => {
          actions.open("outline-view");
        }}
        title="Switch to outline view"
        aria-label="Switch to outline view"
        style={
          leftPanelIsOpen && activeLeftPanelState === "outline-view"
            ? { background: "lightgrey" }
            : { background: "white" }
        }
      >
        <TreeIcon />
      </Button>
      <Button
        onClick={() => {
          actions.change("thumbnail-view");
          actions.leftPanel.open();
          actions.change("current-canvas");
        }}
        title="Switch to thumbnails with canvas"
        aria-label="Switch to thumbnails with canvas"
        style={
          leftPanelIsOpen && activeLeftPanelState === "thumbnail-view"
            ? { background: "lightgrey" }
            : { background: "white" }
        }
      >
        <ThumbnailStripIcon />
      </Button>
      <Button
        onClick={() => {
          actions.centerPanel.change({ id: "thumbnail-grid" });
          actions.leftPanel.close();
        }}
        title="Switch to thumbnails only"
        aria-label="Switch to thumbnails only"
        style={activeCenterPanelState === "thumbnail-grid" ? { background: "lightgrey" } : { background: "white" }}
      >
        <GridIcon />
      </Button>

      <Button
        onClick={() => {
          actions.leftPanel.open({ id: "canvas-list-view" });
        }}
        title="Switch to canvas list"
      >
        <MenuIcon />
      </Button>
      <Button
        onClick={() => {
          actions.leftPanel.open({ id: "canvas-range-view" });
        }}
        title="Switch to structure"
      >
        <ExperimentalIcon />
      </Button>
      <Button
        onClick={() => {
          actions.leftPanel.open({ id: "canvas-vertical-list" });
        }}
        title="Vertical list"
      >
        <CopyIcon />
      </Button>
    </FlexContainerRow>
  );
};
