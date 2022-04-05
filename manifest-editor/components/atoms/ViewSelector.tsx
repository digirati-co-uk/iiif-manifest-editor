import { useContext } from "react";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { GridIcon } from "../icons/GridIcon";
import { ThumbnailStripIcon } from "../icons/ThumbnailStripIcon";
import { TreeIcon } from "../icons/TreeIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { Button } from "./Button";

export const ViewSelector: React.FC = () => {
  const editorContext = useContext(ManifestEditorContext);
  return (
    <FlexContainer>
      <Button
        onClick={() => editorContext?.setView("tree")}
        title="Switch to outline view"
      >
        <TreeIcon />
      </Button>
      <Button
        onClick={() => editorContext?.setView("grid")}
        title="Switch to thumbnails only"
      >
        <GridIcon />
      </Button>
      <Button
        onClick={() => editorContext?.setView("thumbnails")}
        title="Swith to thumbnails with canvas"
      >
        <ThumbnailStripIcon />
      </Button>
    </FlexContainer>
  );
};
