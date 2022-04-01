import { useState, useEffect, useContext } from "react";
import { AddManifestModal } from "../../modals/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../../hooks/useManifest";
import { SaveModal } from "../../modals/SaveModal";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { ExportModal } from "../../modals/ExportModal";
import { FlexContainer } from "../../layout/FlexContainer";
import { NewManifestModal } from "../../modals/NewManifestModal";
import ShellContext from "./ShellContext";

export const ShellOptions: React.FC<{
  save: () => void;
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
  forceShowModal: boolean;
  setForceShowModal: (boolean: boolean) => void;
}> = ({
  save,
  previouslySaved,
  permalink,
  saveAsChoice,
  setSaveAsChoice,
  forceShowModal,
  setForceShowModal,
}) => {
  const shellContext = useContext(ShellContext);
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
        <AddManifestModal
          manifest={manifest ? manifest?.id : ""}
          close={() => setaddModalVisible(false)}
        />
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
      {exportModalVisible && (
        <ExportModal close={() => setExportModalVisible(false)} />
      )}

      {newModalVisible && (
        <NewManifestModal close={() => setNewModalVisible(false)} />
      )}
      <FlexContainer>
        <Dropdown>
          <Button onClick={() => setFileOpen(!fileOpen)}>File</Button>
          {fileOpen && (
            <DropdownContent onMouseLeave={() => setFileOpen(false)}>
              <Button
                onClick={() => setNewModalVisible(!newModalVisible)}
                title="Start a new Manifest"
                color={"#6b6b6b"}
              >
                New
              </Button>
              <Button
                onClick={() => setaddModalVisible(!addModalVisible)}
                title="Add an existing manifest to get started"
                color={"#6b6b6b"}
              >
                Open
              </Button>
              <Button onClick={() => saveClickHandler()}>Save</Button>
              <Button
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
              >
                Export
              </Button>
            </DropdownContent>
          )}
        </Dropdown>
        <Dropdown onMouseLeave={() => setHelpOpen(false)}>
          <Button onClick={() => setHelpOpen(!helpOpen)}>Help</Button>
          {helpOpen && (
            <DropdownContent>
              <Button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  shellContext?.changeSelectedApplication("Splash");
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
