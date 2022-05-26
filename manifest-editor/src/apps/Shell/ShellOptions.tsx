import { useState, useEffect } from "react";
import { AddManifestModal } from "../../components/modals/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../hooks/useManifest";
import { SaveModal } from "../../components/modals/SaveModal";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { ExportModal } from "../../components/modals/ExportModal";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { NewManifestModal } from "../../components/modals/NewManifestModal";
import { useApps } from "../../shell/AppContext/AppContext";
import { ModalButton } from "../../madoc/components/ModalButton";

export const ShellOptions: React.FC<{
  save: null | (() => void);
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
  forceShowModal: boolean;
  setForceShowModal: (boolean: boolean) => void;
}> = ({ save, previouslySaved, permalink, saveAsChoice, setSaveAsChoice, forceShowModal, setForceShowModal }) => {
  const { changeApp } = useApps();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [newModalVisible, setNewModalVisible] = useState(false);

  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const manifest = useManifest();

  useEffect(() => {
    setAddModalVisible(false);
  }, [manifest]);

  const saveClickHandler = () => {
    setFileOpen(!fileOpen);
    if (previouslySaved) {
      if (save) {
        save();
      }
    } else {
      setSaveModalVisible(true);
    }
  };

  return (
    <>
      {addModalVisible && save && (
        <AddManifestModal manifest={manifest ? manifest?.id : ""} close={() => setAddModalVisible(false)} />
      )}
      {(saveModalVisible || forceShowModal) && save && (
        <SaveModal
          close={() => {
            setSaveModalVisible(false);
            setForceShowModal(false);
          }}
          save={save}
          previouslySaved={previouslySaved}
          permalink={permalink}
          saveAsChoice={saveAsChoice}
          setSaveAsChoice={setSaveAsChoice}
        />
      )}
      {exportModalVisible && <ExportModal close={() => setExportModalVisible(false)} />}

      <FlexContainer>
        <Dropdown>
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
                  setAddModalVisible(!addModalVisible);
                }}
                aria-label="Load an existing manifest"
                title="Load an existing manifest"
                color={"#6b6b6b"}
              >
                Open
              </Button>
              <Button aria-label="Save" disabled={!save} onClick={() => saveClickHandler()}>
                Save
              </Button>
              <Button
                aria-label="Save as"
                onClick={() => {
                  setFileOpen(!fileOpen);
                  setSaveModalVisible(!saveModalVisible);
                }}
              >
                Save as...
              </Button>
              <Button
                onClick={() => {
                  setFileOpen(!fileOpen);
                  setExportModalVisible(!exportModalVisible);
                }}
                aria-label="Export"
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
      </FlexContainer>
    </>
  );
};
