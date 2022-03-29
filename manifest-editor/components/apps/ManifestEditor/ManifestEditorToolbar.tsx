import { useContext, useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { AddIcon } from "../../icons/AddIcon";
import { CheckIcon } from "../../icons/CheckIcon";
import { NewCanvasModal } from "../../modals/NewCanvasModal";
import ManifestEditorContext from "./ManifestEditorContext";

export const ManifestEditorToolbar: React.FC<{
  setEditorPanelOpen: (bool: boolean) => void;
}> = ({ setEditorPanelOpen }) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const editorContext = useContext(ManifestEditorContext);

  return (
    <>
      <Button
        // This will change but just to get some MVP
        onClick={() => editorContext?.setAddCanvasModalOpen(true)}
        title="Add a new canvas"
      >
        <AddIcon />
      </Button>
      <Button
        // This will change but just to get some MVP
        onClick={() => setEditorPanelOpen(true)}
        title="Open editor panel"
      >
        Open editor panel
      </Button>

      <Dropdown onMouseLeave={() => setViewOpen(false)}>
        <Button onClick={() => setViewOpen(!viewOpen)}>View</Button>
        {viewOpen && (
          <DropdownContent>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                editorContext?.setView("tree");
              }}
            >
              {editorContext?.view === "tree" && <CheckIcon />}
              Outline
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                editorContext?.setView("thumbnails");
              }}
            >
              {editorContext?.view === "thumbnails" && <CheckIcon />}
              Canvas Thumbnails
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                editorContext?.setView("grid");
              }}
            >
              {editorContext?.view === "thumbnails" && <CheckIcon />}
              Thumbnail Grid
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
      <Dropdown onMouseLeave={() => setPropertiesOpen(false)}>
        <Button onClick={() => setPropertiesOpen(!propertiesOpen)}>
          Properties
        </Button>
        {propertiesOpen && (
          <DropdownContent>
            <Button
              onClick={() => {
                setPropertiesOpen(!propertiesOpen);
                editorContext?.changeSelectedProperty("manifest");
              }}
            >
              Edit Manifest Properties
            </Button>
            <Button
              onClick={() => {
                setPropertiesOpen(!propertiesOpen);
                editorContext?.changeSelectedProperty("canvas");
              }}
            >
              Edit Canvas Properties
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
    </>
  );
};
