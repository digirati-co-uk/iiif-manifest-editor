import { useApps, useLayoutActions } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { Dropdown, DropdownContent } from "@manifest-editor/ui/atoms/Dropdown";
import { useState } from "react";
import { ModalButton } from "@manifest-editor/ui/madoc/components/ModalButton";
import { NewManifestModal } from "./NewManifestModal";

export const ShellOptions: React.FC<{}> = () => {
  const { changeApp } = useApps();
  const actions = useLayoutActions();

  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <div className="flex">
        <Dropdown onMouseLeave={() => setFileOpen(false)}>
          <Button aria-label="open file menu" onClick={() => setFileOpen(!fileOpen)}>
            File
          </Button>
          <div style={fileOpen ? { opacity: 1, pointerEvents: "visible" } : { visibility: "hidden", opacity: 0 }}>
            <DropdownContent onMouseLeave={() => setFileOpen(false)}>
              <ModalButton
                as={Button}
                aria-label="Start a new manifest"
                title="Start a new Manifest"
                modalSize="lg"
                onOpen={() => setFileOpen(false)}
                render={(props) => <NewManifestModal {...props} />}
              >
                New
              </ModalButton>
              <Button
                onClick={() => {
                  setFileOpen(false);
                  changeApp({ id: "splash" });
                }}
                aria-label="Load an existing manifest"
                title="Load an existing manifest"
                color={"#6b6b6b"}
              >
                Open
              </Button>

              <Button
                onClick={() => {
                  actions.open({ id: "export", stacked: true });
                }}
                aria-label="Export to JSON"
                title="Export to JSON"
                color={"#6b6b6b"}
              >
                Export
              </Button>
            </DropdownContent>
          </div>
        </Dropdown>
        <Dropdown onMouseLeave={() => setHelpOpen(false)}>
          <Button aria-label="Help menu" onClick={() => setHelpOpen(!helpOpen)}>
            Help
          </Button>
          {helpOpen && (
            <DropdownContent>
              <Button
                aria-label="About"
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  changeApp({ id: "about" });
                }}
              >
                About
              </Button>
            </DropdownContent>
          )}
        </Dropdown>
      </div>
    </>
  );
};
