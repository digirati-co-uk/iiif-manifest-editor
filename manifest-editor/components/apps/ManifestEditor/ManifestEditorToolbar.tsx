import { useContext, useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { AddIcon } from "../../icons/AddIcon";
import { CheckIcon } from "../../icons/CheckIcon";
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
        aria-label="Add a new canvas"
      >
        <AddIcon />
      </Button>
      <Button
        // This will change but just to get some MVP
        onClick={() => setEditorPanelOpen(true)}
        title="Open editor panel"
        aria-label="Open editor panel"
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
              aria-label="Change view to outline"
            >
              Outline View
              {editorContext?.view === "tree" && <CheckIcon />}
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                editorContext?.setView("thumbnails");
              }}
              aria-label="Change view to thumbnails with canvas"
            >
              Thumbnails with Canvas
              {editorContext?.view === "thumbnails" && <CheckIcon />}
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                editorContext?.setView("grid");
              }}
              aria-label="Change view to thumbnails only"
            >
              Thumbnails Only
              {editorContext?.view === "grid" && <CheckIcon />}
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
                setEditorPanelOpen(true);
                editorContext?.changeSelectedProperty("manifest");
              }}
              aria-label="Edit manifest properties"
            >
              Edit Manifest Properties
            </Button>
            <Button
              onClick={() => {
                setPropertiesOpen(!propertiesOpen);
                setEditorPanelOpen(true);
                editorContext?.changeSelectedProperty("canvas");
              }}
              aria-label="Edit canvas properties"
            >
              Edit Canvas Properties
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
    </>
  );
};
