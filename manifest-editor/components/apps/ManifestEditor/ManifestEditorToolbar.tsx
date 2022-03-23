import { useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { CheckIcon } from "../../icons/CheckIcon";

export const ManifestEditorToolbar: React.FC<{
  setEditorPanelOpen: (bool: boolean) => void;
  setView: (
    view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor"
  ) => void;
  view: "thumbnails" | "tree" | "grid" | "noNav" | "fullEditor";
}> = ({ setView, setEditorPanelOpen, view }) => {
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
              {view === "tree" && <CheckIcon />}
              Outline
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("thumbnails");
              }}
            >
              {view === "thumbnails" && <CheckIcon />}
              Canvas Thumbnails
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("grid");
              }}
            >
              {view === "grid" && <CheckIcon />}
              Thumbnail Grid
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
    </>
  );
};
