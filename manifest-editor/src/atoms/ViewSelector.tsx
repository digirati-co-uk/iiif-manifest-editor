import { useManifestEditor } from "../apps/ManifestEditor/ManifestEditor.context";
import { GridIcon } from "../icons/GridIcon";
import { ThumbnailStripIcon } from "../icons/ThumbnailStripIcon";
import { TreeIcon } from "../icons/TreeIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { Button } from "./Button";

export const ViewSelector: React.FC = () => {
  const editorContext = useManifestEditor();
  return (
    <FlexContainer>
      <Button
        onClick={() => editorContext?.setView("tree")}
        title="Switch to outline view"
        aria-label="Switch to outline view"
      >
        <TreeIcon />
      </Button>
      <Button
        onClick={() => editorContext?.setView("grid")}
        title="Switch to thumbnails only"
        aria-label="Switch to thumbnails only"
      >
        <GridIcon />
      </Button>
      <Button
        onClick={() => editorContext?.setView("thumbnails")}
        title="Switch to thumbnails with canvas"
        aria-label="Switch to thumbnails with canvas"
      >
        <ThumbnailStripIcon />
      </Button>
    </FlexContainer>
  );
};
