import { useState, useEffect, useContext } from "react";
import { AddManifestModal } from "../../components/modals/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../hooks/useManifest";
import { SaveModal } from "../../components/modals/SaveModal";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { ExportModal } from "../../components/modals/ExportModal";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { NewManifestModal } from "../../components/modals/NewManifestModal";
import { useShell } from "../../context/ShellContext/ShellContext";

export const ShellOptions: React.FC<{
  save: () => void;
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
  forceShowModal: boolean;
  setForceShowModal: (boolean: boolean) => void;
}> = ({ save, previouslySaved, permalink, saveAsChoice, setSaveAsChoice, forceShowModal, setForceShowModal }) => {
  const shellContext = useShell();
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [newModalVisible, setNewModalVisible] = useState(false);

  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const manifest = useManifest();

  useEffect(() => {
    setaddModalVisible(false);
  }, [manifest]);

  const saveClickHandler = () => {
    setFileOpen(!fileOpen);
    if (previouslySaved) {
      save();
    } else {
      setSaveModalVisible(true);
    }
  };

  return (
    <>
      {addModalVisible && (
        <AddManifestModal manifest={manifest ? manifest?.id : ""} close={() => setaddModalVisible(false)} save={save} />
      )}
      {(saveModalVisible || forceShowModal) && (
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

      {newModalVisible && <NewManifestModal close={() => setNewModalVisible(false)} save={save} />}
      <FlexContainer>
        <Dropdown>
          <Button aria-label="open file menu" onClick={() => setFileOpen(!fileOpen)}>
            File
          </Button>
          {fileOpen && (
            <DropdownContent onMouseLeave={() => setFileOpen(false)}>
              <Button
                onClick={() => {
                  setFileOpen(false);
                  setNewModalVisible(!newModalVisible);
                }}
                aria-label="Start a new manifest"
                title="Start a new Manifest"
                color={"#6b6b6b"}
              >
                New
              </Button>
              <Button
                onClick={() => {
                  setFileOpen(false);
                  setaddModalVisible(!addModalVisible);
                }}
                aria-label="Load an existing manifest"
                title="Load an existing manifest"
                color={"#6b6b6b"}
              >
                Open
              </Button>
              <Button aria-label="Save" onClick={() => saveClickHandler()}>
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
          )}
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
                  shellContext.changeSelectedApplication("Splash");
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
