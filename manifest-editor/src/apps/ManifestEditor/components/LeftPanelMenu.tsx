import { useLayoutActions, useLayoutState } from "../../../shell/Layout/Layout.context";
import { FlexContainerRow } from "../../../components/layout/FlexContainer";
import { Button } from "../../../atoms/Button";
import { TreeIcon } from "../../../icons/TreeIcon";
import { GridIcon } from "../../../icons/GridIcon";
import { ThumbnailStripIcon } from "../../../icons/ThumbnailStripIcon";

export function LeftPanelMenu() {
  const actions = useLayoutActions();
  const { leftPanel } = useLayoutState();

  return (
    // <FlexContainerRow>
    //   {/*<ViewSelector />*/}
    //   {leftPanel.current === "thumbnail-strip" ? (
    //     <HeightWidthSwitcher
    //       options={[
    //         { h: 128, w: 128 },
    //         { h: 256, w: 256 },
    //         { h: 512, w: 512 },
    //         { h: 1024, w: 1024 },
    //       ]}
    //       label={`${leftPanel.state?.width || 128}`}
    //       onOptionClick={(selected: ThumbnailSize) => actions.change("thumbnail-strip", { width: selected.w })}
    //     />
    //   ) : null}
    // </FlexContainerRow>
    <FlexContainerRow>
      <Button
        onClick={() => actions.change("outline-view")}
        title="Switch to outline view"
        aria-label="Switch to outline view"
      >
        <TreeIcon />
      </Button>
      <Button
        onClick={() => {
          actions.centerPanel.change({ id: "thumbnail-grid" });
          actions.leftPanel.close();
        }}
        title="Switch to thumbnails only"
        aria-label="Switch to thumbnails only"
      >
        <GridIcon />
      </Button>
      <Button
        onClick={() => {
          actions.change("thumbnail-view");
          actions.change("current-canvas");
        }}
        title="Switch to thumbnails with canvas"
        aria-label="Switch to thumbnails with canvas"
      >
        <ThumbnailStripIcon />
      </Button>
    </FlexContainerRow>
  );
}
