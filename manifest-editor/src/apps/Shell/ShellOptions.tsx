import { useState } from "react";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { NewManifestModal } from "../../components/modals/NewManifestModal";
import { useApps } from "../../shell/AppContext/AppContext";
import { ModalButton } from "../../madoc/components/ModalButton";
import { ExportToJson } from "../../components/widgets/ExportToJSON";

export const ShellOptions: React.FC<{}> = () => {
  const { changeApp } = useApps();
  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <FlexContainer>
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
              <ModalButton
                as={Button}
                aria-label="Export to JSON"
                title="Export to JSON"
                modalSize="lg"
                onOpen={() => setFileOpen(false)}
                render={(props) => <ExportToJson {...props} />}
              >
                Export
              </ModalButton>
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
      </FlexContainer>
    </>
  );
};
