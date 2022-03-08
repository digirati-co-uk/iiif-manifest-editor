import { useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";

export const ManifestEditorToolbar: React.FC<{
  setEditorPanelOpen: (bool: boolean) => void;
  setView: (view: "thumbnails" | "tree") => void;
}> = ({
  setView,
  setEditorPanelOpen,
}) => {

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
              IIIF Tree Structure
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("thumbnails");
              }}
            >
              Canvas Thumbnails
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
    </>
  );
};
