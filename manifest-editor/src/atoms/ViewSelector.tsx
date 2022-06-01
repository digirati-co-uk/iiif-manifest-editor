import { GridIcon } from "../icons/GridIcon";
import { ThumbnailStripIcon } from "../icons/ThumbnailStripIcon";
import { TreeIcon } from "../icons/TreeIcon";
import { FlexContainerRow } from "../components/layout/FlexContainer";
import { Button } from "./Button";
import { useLayoutActions } from "../shell/Layout/Layout.context";

export const ViewSelector: React.FC = () => {
  const actions = useLayoutActions();

  return (
    <FlexContainerRow justify="center">
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
};
