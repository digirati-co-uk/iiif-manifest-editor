import { useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";

export const ManifestEditorToolbar: React.FC<{
  setEditorPanelOpen: (bool: boolean) => void;
  setView: (
    view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor"
  ) => void;
}> = ({ setView, setEditorPanelOpen }) => {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
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
                setView("tree");
              }}
            >
              Outline
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("thumbnails");
              }}
            >
              Canvas Thumbnails
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("grid");
              }}
            >
              Thumbnail Grid
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
    </>
  );
};